const Review = require('../models/Review');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated, getPagination } = require('../utils/responseHelper');

// ─── POST /api/reviews ────────────────────────────────────────────────────
// Rider submits a review after a completed ride
const createReview = asyncHandler(async (req, res, next) => {
  const { rideId, rating, comment } = req.body;

  if (!rideId) return next(new AppError('Ride ID is required', 400));
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  // Find the ride
  const ride = await Ride.findById(rideId);
  if (!ride) return next(new AppError('Ride not found', 404));

  // Only the rider of this ride can review
  if (ride.riderId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to review this ride', 403));
  }

  // Ride must be completed
  if (ride.status !== 'completed') {
    return next(new AppError('You can only review completed rides', 400));
  }

  // Must have a driver assigned
  if (!ride.driverId) {
    return next(new AppError('No driver found for this ride', 400));
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ rideId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this ride', 400));
  }

  // Create review
  const review = await Review.create({
    rideId,
    riderId: req.user._id,
    driverId: ride.driverId,
    rating: parseInt(rating),
    comment: comment?.trim() || null,
  });

  // post-save hook in Review model auto-updates driver's average rating

  return sendSuccess(res, 201, review, 'Review submitted successfully');
});

// ─── GET /api/reviews/driver/:driverId ────────────────────────────────────
// Get all reviews for a specific driver
const getDriverReviews = asyncHandler(async (req, res, next) => {
  const { driverId } = req.params;
  const { page, limit, skip } = getPagination(req.query);

  const driver = await Driver.findById(driverId);
  if (!driver) return next(new AppError('Driver not found', 404));

  const [reviews, total] = await Promise.all([
    Review.find({ driverId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('riderId', 'name profileImage')
      .populate('rideId', 'pickup destination createdAt')
      .lean(),
    Review.countDocuments({ driverId }),
  ]);

  // Rating breakdown
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const allRatings = await Review.find({ driverId }).select('rating').lean();
  allRatings.forEach((r) => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

  return sendPaginated(res, reviews, total, page, limit);
});

// ─── GET /api/reviews/my ──────────────────────────────────────────────────
// Get all reviews submitted by current rider
const getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find({ riderId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name profileImage' },
      })
      .populate('rideId', 'pickup destination createdAt fare finalFare')
      .lean(),
    Review.countDocuments({ riderId: req.user._id }),
  ]);

  return sendPaginated(res, reviews, total, page, limit);
});

// ─── GET /api/reviews/ride/:rideId ────────────────────────────────────────
// Get review for a specific ride
const getReviewByRide = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ rideId: req.params.rideId })
    .populate('riderId', 'name profileImage')
    .populate({
      path: 'driverId',
      populate: { path: 'userId', select: 'name profileImage' },
    });

  return sendSuccess(res, 200, review || null);
});

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────
// Admin can delete a review
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  await review.deleteOne();

  // Recalculate driver rating after deletion
  const stats = await Review.aggregate([
    { $match: { driverId: review.driverId } },
    { $group: { _id: '$driverId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Driver.findByIdAndUpdate(review.driverId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].count,
    });
  } else {
    await Driver.findByIdAndUpdate(review.driverId, { rating: 0, totalRatings: 0 });
  }

  return sendSuccess(res, 200, {}, 'Review deleted');
});

module.exports = {
  createReview,
  getDriverReviews,
  getMyReviews,
  getReviewByRide,
  deleteReview,
};