const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

// ─── GET /api/search?q=&type=rides|drivers|all
const globalSearch = asyncHandler(async (req, res) => {
  const { q = '', type = 'all' } = req.query;

  if (!q.trim()) {
    return sendSuccess(res, 200, { rides: [], drivers: [] });
  }

  const results = {};

  // Search rides
  if (type === 'all' || type === 'rides') {
    const rides = await Ride.find({
      $or: [
        { 'pickup.address': { $regex: q, $options: 'i' } },
        { 'destination.address': { $regex: q, $options: 'i' } },
        { status: { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('riderId', 'name email')
      .lean();
    results.rides = rides;
  }

  // Search drivers
  if (type === 'all' || type === 'drivers') {
    const users = await User.find({
      role: 'driver',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    }).select('_id').lean();

    const userIds = users.map((u) => u._id);

    const drivers = await Driver.find({
      $or: [
        { userId: { $in: userIds } },
        { licenseNumber: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(10)
      .populate('userId', 'name email phone')
      .lean();

    const driverIds = drivers.map((d) => d._id);
    const vehicles = await Vehicle.find({ driverId: { $in: driverIds } }).lean();
    const vehicleMap = {};
    vehicles.forEach((v) => { vehicleMap[v.driverId.toString()] = v; });

    results.drivers = drivers.map((d) => ({
      ...d,
      vehicle: vehicleMap[d._id.toString()] || null,
    }));
  }

  return sendSuccess(res, 200, results);
});

module.exports = { globalSearch };