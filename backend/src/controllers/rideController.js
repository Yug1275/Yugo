const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated, getPagination } = require('../utils/responseHelper');

const BASE_FARE = 30;
const PER_KM = 12;

// ─── POST /api/rides/estimate ─────────────────────────────────────────────
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

// ─── POST /api/rides ──────────────────────────────────────────────────────
const createRide = asyncHandler(async (req, res, next) => {
  const { pickup, destination, fare, distanceKm, durationMin } = req.body;

  if (!pickup || !destination) {
    return next(new AppError('Pickup and destination are required', 400));
  }
  if (!pickup.coordinates?.lat || !pickup.coordinates?.lng) {
    return next(new AppError('Pickup coordinates are required', 400));
  }
  if (!destination.coordinates?.lat || !destination.coordinates?.lng) {
    return next(new AppError('Destination coordinates are required', 400));
  }

  // Check if rider already has an active ride
  const activeRide = await Ride.findOne({
    riderId: req.user._id,
    status: { $in: ['pending', 'accepted', 'en_route', 'started'] },
  });
  if (activeRide) {
    return next(new AppError('You already have an active ride. Complete or cancel it first.', 400));
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

  // ─── Notify all online drivers via Socket.IO ──────────────────────
  const io = req.app.get('io');
  if (io) {
      console.log(`📡 Emitting ride:newRequest for ride ${ride._id} to all sockets`);
    const populatedRide = await Ride.findById(ride._id)
      .populate('riderId', 'name phone')
      .lean();

    io.emit('ride:newRequest', {
      rideId: ride._id,
      pickup: ride.pickup,
      destination: ride.destination,
      fare: ride.fare,
      distanceKm: ride.distanceKm,
      rider: populatedRide.riderId,
    });
  }

  return sendSuccess(res, 201, ride, 'Ride booked successfully');
});

// ─── GET /api/rides/active ────────────────────────────────────────────────
const getActiveRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({
    riderId: req.user._id,
    status: { $in: ['pending', 'accepted', 'en_route', 'started'] },
  })
    .populate('riderId', 'name phone profileImage')
    .populate({
      path: 'driverId',
      populate: { path: 'userId', select: 'name phone profileImage' },
    });

  return sendSuccess(res, 200, ride || null);
});

// ─── GET /api/rides/:id ───────────────────────────────────────────────────
const getRideById = asyncHandler(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id)
    .populate('riderId', 'name phone profileImage')
    .populate({
      path: 'driverId',
      populate: [
        { path: 'userId', select: 'name phone profileImage' },
      ],
    });

  if (!ride) return next(new AppError('Ride not found', 404));

  // Only rider or driver of this ride can view it
  const isRider = ride.riderId?._id?.toString() === req.user._id.toString();
  const isDriver = ride.driverId?.userId?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isRider && !isDriver && !isAdmin) {
    return next(new AppError('Not authorized to view this ride', 403));
  }

  return sendSuccess(res, 200, ride);
});

// ─── GET /api/rides ───────────────────────────────────────────────────────
const getAllRides = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [rides, total] = await Promise.all([
    Ride.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('riderId', 'name email')
      .lean(),
    Ride.countDocuments(filter),
  ]);

  return sendPaginated(res, rides, total, page, limit);
});

// ─── PUT /api/rides/:id/cancel ────────────────────────────────────────────
const cancelRide = asyncHandler(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return next(new AppError('Ride not found', 404));

  const cancellableStatuses = ['pending', 'accepted', 'en_route'];
  if (!cancellableStatuses.includes(ride.status)) {
    return next(new AppError(`Cannot cancel a ride with status: ${ride.status}`, 400));
  }

  const isRider = ride.riderId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isRider && !isAdmin) {
    return next(new AppError('Not authorized to cancel this ride', 403));
  }

  ride.status = 'cancelled';
  ride.cancelledBy = isAdmin ? 'system' : 'rider';
  ride.cancelReason = req.body.reason || 'Cancelled by rider';
  await ride.save();

  return sendSuccess(res, 200, ride, 'Ride cancelled successfully');
});

// ─── PUT /api/rides/:id/accept (Driver) ───────────────────────────────────
const acceptRide = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));
  if (!driver.isApproved) return next(new AppError('Your driver account is not approved yet', 403));

  const ride = await Ride.findById(req.params.id);
  if (!ride) return next(new AppError('Ride not found', 404));
  if (ride.status !== 'pending') return next(new AppError('Ride is no longer available', 400));

  ride.driverId = driver._id;
  ride.status = 'accepted';
  await ride.save();

  await Driver.findByIdAndUpdate(driver._id, { availability: false });

  return sendSuccess(res, 200, ride, 'Ride accepted');
});

// ─── PUT /api/rides/:id/start (Driver) ────────────────────────────────────
const startRide = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));

  const ride = await Ride.findById(req.params.id);
  if (!ride) return next(new AppError('Ride not found', 404));
  if (ride.driverId?.toString() !== driver._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }
  if (ride.status !== 'accepted' && ride.status !== 'en_route') {
    return next(new AppError('Ride cannot be started at this stage', 400));
  }

  ride.status = 'started';
  ride.startTime = new Date();
  await ride.save();

  return sendSuccess(res, 200, ride, 'Ride started');
});

// ─── PUT /api/rides/:id/complete (Driver) ─────────────────────────────────
const completeRide = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));

  const ride = await Ride.findById(req.params.id);
  if (!ride) return next(new AppError('Ride not found', 404));
  if (ride.driverId?.toString() !== driver._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }
  if (ride.status !== 'started') {
    return next(new AppError('Ride must be started before completing', 400));
  }

  ride.status = 'completed';
  ride.endTime = new Date();
  ride.finalFare = ride.fare;
  await ride.save();

  // Update driver stats
  await Driver.findByIdAndUpdate(driver._id, {
    $inc: { totalRides: 1, totalEarnings: ride.finalFare },
    availability: true,
  });

  return sendSuccess(res, 200, ride, 'Ride completed');
});

module.exports = {
  estimateFare,
  createRide,
  getActiveRide,
  getRideById,
  getAllRides,
  cancelRide,
  acceptRide,
  startRide,
  completeRide,
};