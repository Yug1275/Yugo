const express = require('express');
const router = express.Router();
const {
  estimateFare,
  createRide,
  getActiveRide,
  getRideById,
  getAllRides,
  cancelRide,
  acceptRide,
  startRide,
  completeRide,
} = require('../controllers/rideController');
const { protect, riderOnly, driverOnly, adminOnly } = require('../middleware/authMiddleware');

router.post('/estimate', protect, estimateFare);
router.get('/active', protect, riderOnly, getActiveRide);
router.post('/', protect, riderOnly, createRide);
router.get('/', protect, adminOnly, getAllRides);
router.get('/:id', protect, getRideById);
router.put('/:id/cancel', protect, cancelRide);
router.put('/:id/accept', protect, driverOnly, acceptRide);
router.put('/:id/start', protect, driverOnly, startRide);
router.put('/:id/complete', protect, driverOnly, completeRide);

module.exports = router;