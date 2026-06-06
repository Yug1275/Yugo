const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/driverController');
const { protect, driverOnly, adminOnly } = require('../middleware/authMiddleware');

const Driver = require('../models/Driver');
const asyncHandler = require('../utils/asyncHandler');

// TEMP — self approve for development, remove before Phase 15
router.put('/approve-self', protect, driverOnly, asyncHandler(async (req, res) => {
  const driver = await Driver.findOneAndUpdate(
    { userId: req.user._id },
    { isApproved: true },
    { new: true }
  );
  res.json({ success: true, message: 'Approved', data: driver });
}));

// Public / Rider accessible
router.get('/nearby', protect, getNearbyDrivers);
router.get('/search', protect, adminOnly, searchDrivers);

// Driver only
router.get('/me', protect, driverOnly, getMyDriverProfile);
router.post('/profile', protect, driverOnly, completeDriverProfile);
router.put('/availability', protect, driverOnly, toggleAvailability);
router.put('/location', protect, driverOnly, updateLocation);
router.get('/rides', protect, driverOnly, getDriverRides);
router.get('/earnings', protect, driverOnly, getDriverEarnings);
router.get('/pending-rides', protect, driverOnly, getPendingRides);

// Admin or self
router.get('/:id', protect, getDriverById);

module.exports = router;