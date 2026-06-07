const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  recordCashPayment,
  getPaymentByRide,
  getMyPayments,
  getAllPayments,
  refundPayment,
} = require('../controllers/paymentController');
const {
  protect,
  riderOnly,
  adminOnly,
} = require('../middleware/authMiddleware');

// Rider routes
router.post('/create-order', protect, riderOnly, createOrder);
router.post('/verify', protect, riderOnly, verifyPayment);
router.post('/cash', protect, riderOnly, recordCashPayment);
router.get('/my', protect, riderOnly, getMyPayments);
router.get('/ride/:rideId', protect, getPaymentByRide);

// Admin routes
router.get('/', protect, adminOnly, getAllPayments);
router.post('/refund', protect, adminOnly, refundPayment);

module.exports = router;