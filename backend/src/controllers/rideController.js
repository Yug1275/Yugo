const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseHelper');

const BASE_FARE = 30;
const PER_KM = 12;

// ─── POST /api/rides/estimate
const estimateFare = asyncHandler(async (req, res, next) => {
  const { pickup, destination, distanceKm } = req.body;
  if (!pickup || !destination) {
    return next(new AppError('Pickup and destination are required', 400));
  }

  let distance = distanceKm;
  if (!distance && pickup.coordinates && destination.coordinates) {
    const R = 6371;
    const dLat = ((destination.coordinates.lat - pickup.coordinates.lat) * Math.PI) / 180;
    const dLng = ((destination.coordinates.lng - pickup.coordinates.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickup.coordinates.lat * Math.PI) / 180) *
        Math.cos((destination.coordinates.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    distance = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }

  const fare = Math.round(BASE_FARE + (distance || 0) * PER_KM);
  return sendSuccess(res, 200, { fare, distanceKm: distance });
});

// ─── POST /api/rides
const createRide = asyncHandler(async (req, res, next) => {
  const { pickup, destination, fare, distanceKm, durationMin } = req.body;
  if (!pickup || !destination) {
    return next(new AppError('Pickup and destination are required', 400));
  }

  const ride = await Ride.create({
    riderId: req.user._id,
    pickup,
    destination,
    fare: fare || Math.round(BASE_FARE + (distanceKm || 0) * PER_KM),
    distanceKm: distanceKm || null,
    durationMin: durationMin || null,
    status: 'pending',
  });

  return sendSuccess(res, 201, ride, 'Ride booked successfully');
});

// ─── GET /api/rides/:id
const getRideById = asyncHandler(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id)
    .populate('riderId', 'name phone profileImage')
    .populate({ path: 'driverId', populate: { path: 'userId', select: 'name phone' } });

  if (!ride) return next(new AppError('Ride not found', 404));
  return sendSuccess(res, 200, ride);
});

// ─── PUT /api/rides/:id/cancel
const cancelRide = asyncHandler(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return next(new AppError('Ride not found', 404));

  const cancellableStatuses = ['pending', 'accepted', 'en_route'];
  if (!cancellableStatuses.includes(ride.status)) {
    return next(new AppError(`Cannot cancel a ride with status: ${ride.status}`, 400));
  }

  const isRider = ride.riderId.toString() === req.user._id.toString();
  if (!isRider) return next(new AppError('Not authorized to cancel this ride', 403));

  ride.status = 'cancelled';
  ride.cancelledBy = 'rider';
  ride.cancelReason = req.body.reason || 'Cancelled by rider';
  await ride.save();

  return sendSuccess(res, 200, ride, 'Ride cancelled');
});

module.exports = { estimateFare, createRide, getRideById, cancelRide };