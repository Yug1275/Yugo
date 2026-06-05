const express = require('express');
const router = express.Router();
const { getNearbyDrivers } = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');

router.get('/nearby', protect, getNearbyDrivers);

module.exports = router;