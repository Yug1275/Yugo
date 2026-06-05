const User = require('../models/User');
const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated, getPagination } = require('../utils/responseHelper');

// ─── GET /api/users/rides  (rider's own ride history)
const getMyRides = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { riderId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [rides, total] = await Promise.all([
    Ride.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('driverId', 'userId rating')
      .lean(),
    Ride.countDocuments(filter),
  ]);

  return sendPaginated(res, rides, total, page, limit);
});

// ─── POST /api/users/saved-locations
const addSavedLocation = asyncHandler(async (req, res, next) => {
  const { label, address, coordinates } = req.body;
  if (!label || !address || !coordinates?.lat || !coordinates?.lng) {
    return next(new AppError('label, address and coordinates are required', 400));
  }

  const user = await User.findById(req.user._id);
  if (user.savedLocations.length >= 10) {
    return next(new AppError('Maximum 10 saved locations allowed', 400));
  }

  user.savedLocations.push({ label, address, coordinates });
  await user.save();

  return sendSuccess(res, 201, { savedLocations: user.savedLocations }, 'Location saved');
});

// ─── DELETE /api/users/saved-locations/:index
const removeSavedLocation = asyncHandler(async (req, res, next) => {
  const index = parseInt(req.params.index);
  const user = await User.findById(req.user._id);

  if (index < 0 || index >= user.savedLocations.length) {
    return next(new AppError('Invalid location index', 400));
  }

  user.savedLocations.splice(index, 1);
  await user.save();

  return sendSuccess(res, 200, { savedLocations: user.savedLocations }, 'Location removed');
});

module.exports = { getMyRides, addSavedLocation, removeSavedLocation };