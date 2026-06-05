const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

// ─── GET /api/drivers/nearby?lat=&lng=
const getNearbyDrivers = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5 } = req.query; // radius in km

  // Get all online, approved, non-suspended drivers
  const drivers = await Driver.find({
    availability: true,
    isApproved: true,
    isSuspended: false,
    'currentLocation.lat': { $ne: null },
    'currentLocation.lng': { $ne: null },
  })
    .populate('userId', 'name profileImage')
    .lean();

  // Filter by radius if coordinates provided
  let nearbyDrivers = drivers;
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    nearbyDrivers = drivers.filter((driver) => {
      const dLat = driver.currentLocation.lat;
      const dLng = driver.currentLocation.lng;
      if (!dLat || !dLng) return false;
      // Simple Haversine approximation
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

  // Attach vehicle info
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

module.exports = { getNearbyDrivers };