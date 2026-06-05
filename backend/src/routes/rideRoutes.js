const express = require('express');
const router = express.Router();
const { estimateFare, createRide, getRideById, cancelRide } = require('../controllers/rideController');
const { protect, riderOnly } = require('../middleware/authMiddleware');

router.post('/estimate', protect, estimateFare);
router.post('/', protect, riderOnly, createRide);
router.get('/:id', protect, getRideById);
router.put('/:id/cancel', protect, cancelRide);

module.exports = router;