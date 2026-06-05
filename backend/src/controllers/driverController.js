const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated, getPagination } = require('../utils/responseHelper');

// ─── GET /api/drivers/nearby ──────────────────────────────────────────────
const getNearbyDrivers = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5 } = req.query;

  const drivers = await Driver.find({
    availability: true,
    isApproved: true,
    isSuspended: false,
    'currentLocation.lat': { $ne: null },
    'currentLocation.lng': { $ne: null },
  })
    .populate('userId', 'name profileImage')
    .lean();

  let nearbyDrivers = drivers;

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    nearbyDrivers = drivers.filter((driver) => {
      const dLat = driver.currentLocation.lat;
      const dLng = driver.currentLocation.lng;
      if (!dLat || !dLng) return false;
      const R = 6371;
      const dLatR = ((dLat - userLat) * Math.PI) / 180;
      const dLngR = ((dLng - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLatR / 2) * Math.sin(dLatR / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((dLat * Math.PI) / 180) *
          Math.sin(dLngR / 2) *
          Math.sin(dLngR / 2);
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return distance <= parseFloat(radius);
    });
  }

  const driverIds = nearbyDrivers.map((d) => d._id);
  const vehicles = await Vehicle.find({ driverId: { $in: driverIds } }).lean();
  const vehicleMap = {};
  vehicles.forEach((v) => { vehicleMap[v.driverId.toString()] = v; });

  const result = nearbyDrivers.map((d) => ({
    ...d,
    vehicle: vehicleMap[d._id.toString()] || null,
  }));

  return sendSuccess(res, 200, result);
});

// ─── GET /api/drivers/me ──────────────────────────────────────────────────
const getMyDriverProfile = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id })
    .populate('userId', 'name email phone profileImage');

  if (!driver) return next(new AppError('Driver profile not found', 404));

  const vehicle = await Vehicle.findOne({ driverId: driver._id });

  return sendSuccess(res, 200, { driver, vehicle });
});

// ─── POST /api/drivers/profile ────────────────────────────────────────────
const completeDriverProfile = asyncHandler(async (req, res, next) => {
  const { licenseNumber, vehicleType, vehicleNumber, vehicleModel, vehicleColor, vehicleYear } = req.body;

  if (!licenseNumber) return next(new AppError('License number is required', 400));
  if (!vehicleType || !vehicleNumber || !vehicleModel) {
    return next(new AppError('Vehicle type, number and model are required', 400));
  }

  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));

  // Check duplicate license
  const existing = await Driver.findOne({
    licenseNumber: licenseNumber.toUpperCase(),
    _id: { $ne: driver._id },
  });
  if (existing) return next(new AppError('License number already registered', 409));

  // Check duplicate vehicle number
  const existingVehicle = await Vehicle.findOne({
    vehicleNumber: vehicleNumber.toUpperCase(),
    driverId: { $ne: driver._id },
  });
  if (existingVehicle) return next(new AppError('Vehicle number already registered', 409));

  // Update driver
  driver.licenseNumber = licenseNumber.toUpperCase();
  await driver.save();

  // Upsert vehicle
  let vehicle = await Vehicle.findOne({ driverId: driver._id });
  if (vehicle) {
    vehicle.vehicleType = vehicleType;
    vehicle.vehicleNumber = vehicleNumber.toUpperCase();
    vehicle.vehicleModel = vehicleModel;
    vehicle.vehicleColor = vehicleColor || null;
    vehicle.vehicleYear = vehicleYear || null;
    await vehicle.save();
  } else {
    vehicle = await Vehicle.create({
      driverId: driver._id,
      vehicleType,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleModel,
      vehicleColor: vehicleColor || null,
      vehicleYear: vehicleYear || null,
    });
  }

  return sendSuccess(res, 200, { driver, vehicle }, 'Driver profile updated successfully');
});

// ─── PUT /api/drivers/availability ───────────────────────────────────────
const toggleAvailability = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));

  if (!driver.isApproved) {
    return next(new AppError('Your account is pending admin approval', 403));
  }
  if (driver.isSuspended) {
    return next(new AppError('Your account is suspended', 403));
  }

  driver.availability = !driver.availability;
  await driver.save();

  return sendSuccess(
    res, 200,
    { availability: driver.availability },
    `You are now ${driver.availability ? 'online' : 'offline'}`
  );
});

// ─── PUT /api/drivers/location ────────────────────────────────────────────
const updateLocation = asyncHandler(async (req, res, next) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return next(new AppError('lat and lng are required', 400));

  const driver = await Driver.findOneAndUpdate(
    { userId: req.user._id },
    { currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } },
    { new: true }
  );

  if (!driver) return next(new AppError('Driver profile not found', 404));
  return sendSuccess(res, 200, { currentLocation: driver.currentLocation });
});

// ─── GET /api/drivers/rides ───────────────────────────────────────────────
const getDriverRides = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));

  const { page, limit, skip } = getPagination(req.query);
  const filter = { driverId: driver._id };
  if (req.query.status) filter.status = req.query.status;

  const [rides, total] = await Promise.all([
    Ride.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('riderId', 'name phone profileImage')
      .lean(),
    Ride.countDocuments(filter),
  ]);

  return sendPaginated(res, rides, total, page, limit);
});

// ─── GET /api/drivers/earnings ────────────────────────────────────────────
const getDriverEarnings = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));

  // Completed rides in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rides = await Ride.find({
    driverId: driver._id,
    status: 'completed',
    createdAt: { $gte: thirtyDaysAgo },
  }).sort({ createdAt: -1 }).lean();

  // Daily breakdown
  const dailyMap = {};
  rides.forEach((ride) => {
    const day = new Date(ride.createdAt).toLocaleDateString('en-IN');
    if (!dailyMap[day]) dailyMap[day] = { date: day, rides: 0, earnings: 0 };
    dailyMap[day].rides += 1;
    dailyMap[day].earnings += ride.finalFare || ride.fare || 0;
  });
  const daily = Object.values(dailyMap).slice(0, 14);

  // Today's earnings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRides = rides.filter((r) => new Date(r.createdAt) >= today);
  const todayEarnings = todayRides.reduce((s, r) => s + (r.finalFare || r.fare || 0), 0);

  // This week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRides = rides.filter((r) => new Date(r.createdAt) >= weekAgo);
  const weekEarnings = weekRides.reduce((s, r) => s + (r.finalFare || r.fare || 0), 0);

  return sendSuccess(res, 200, {
    totalEarnings: driver.totalEarnings,
    totalRides: driver.totalRides,
    rating: driver.rating,
    todayEarnings,
    todayRides: todayRides.length,
    weekEarnings,
    weekRides: weekRides.length,
    daily,
    recentRides: rides.slice(0, 5),
  });
});

// ─── GET /api/drivers/pending-rides ──────────────────────────────────────
const getPendingRides = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) return next(new AppError('Driver profile not found', 404));
  if (!driver.isApproved) return next(new AppError('Account not approved', 403));

  const rides = await Ride.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('riderId', 'name phone profileImage')
    .lean();

  return sendSuccess(res, 200, rides);
});

// ─── GET /api/drivers/search ──────────────────────────────────────────────
const searchDrivers = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const users = await User.find({
    role: 'driver',
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  }).select('_id name email').lean();

  const userIds = users.map((u) => u._id);

  const filter = {
    $or: [
      { userId: { $in: userIds } },
      { licenseNumber: { $regex: q, $options: 'i' } },
    ],
  };

  const [drivers, total] = await Promise.all([
    Driver.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phone profileImage')
      .lean(),
    Driver.countDocuments(filter),
  ]);

  const driverIds = drivers.map((d) => d._id);
  const vehicles = await Vehicle.find({ driverId: { $in: driverIds } }).lean();
  const vehicleMap = {};
  vehicles.forEach((v) => { vehicleMap[v.driverId.toString()] = v; });

  const result = drivers.map((d) => ({
    ...d,
    vehicle: vehicleMap[d._id.toString()] || null,
  }));

  return sendPaginated(res, result, total, page, limit);
});

// ─── GET /api/drivers/:id ─────────────────────────────────────────────────
const getDriverById = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id)
    .populate('userId', 'name email phone profileImage');
  if (!driver) return next(new AppError('Driver not found', 404));
  const vehicle = await Vehicle.findOne({ driverId: driver._id });
  return sendSuccess(res, 200, { driver, vehicle });
});

module.exports = {
  getNearbyDrivers,
  getMyDriverProfile,
  completeDriverProfile,
  toggleAvailability,
  updateLocation,
  getDriverRides,
  getDriverEarnings,
  getPendingRides,
  searchDrivers,
  getDriverById,
};