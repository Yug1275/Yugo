const crypto = require('crypto');
const razorpay = require('../utils/razorpay');
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated, getPagination } = require('../utils/responseHelper');

// ─── POST /api/payments/create-order ─────────────────────────────────────
// Creates a Razorpay order for a completed ride
const createOrder = asyncHandler(async (req, res, next) => {
  const { rideId } = req.body;

  if (!rideId) return next(new AppError('Ride ID is required', 400));

  // Find the ride
  const ride = await Ride.findById(rideId);
  if (!ride) return next(new AppError('Ride not found', 404));

  // Only rider of this ride can pay
  if (ride.riderId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to pay for this ride', 403));
  }

  // Ride must be completed
  if (ride.status !== 'completed') {
    return next(new AppError('Payment can only be made for completed rides', 400));
  }

  // Check if already paid
  const existingPayment = await Payment.findOne({
    rideId,
    status: 'completed',
  });
  if (existingPayment) {
    return next(new AppError('This ride has already been paid for', 400));
  }

  const amount = ride.finalFare || ride.fare;

  // Create Razorpay order
  // Amount must be in paise (multiply by 100)
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: `ride_${rideId}`,
    notes: {
      rideId: rideId.toString(),
      riderId: req.user._id.toString(),
    },
  });

  // Create payment record in DB with pending status
  let payment = await Payment.findOne({ rideId });
  if (payment) {
    payment.razorpayOrderId = razorpayOrder.id;
    payment.amount = amount;
    payment.status = 'pending';
    await payment.save();
  } else {
    payment = await Payment.create({
      rideId,
      riderId: req.user._id,
      amount,
      currency: 'INR',
      status: 'pending',
      method: 'card',
      razorpayOrderId: razorpayOrder.id,
    });
  }

  return sendSuccess(res, 201, {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    paymentId: payment._id,
    ride: {
      id: ride._id,
      pickup: ride.pickup?.address,
      destination: ride.destination?.address,
      fare: amount,
    },
  }, 'Razorpay order created');
});

// ─── POST /api/payments/verify ────────────────────────────────────────────
// Verifies Razorpay payment signature and marks payment as complete
const verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    rideId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError('Payment verification data is incomplete', 400));
  }

  // Verify signature
  // Razorpay signature = HMAC-SHA256(order_id + '|' + payment_id, key_secret)
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    // Mark payment as failed
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    return next(new AppError('Payment verification failed. Invalid signature.', 400));
  }

  // Fetch payment details from Razorpay
  const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

  // Determine method
  const methodMap = {
    card: 'card',
    upi: 'upi',
    wallet: 'wallet',
    netbanking: 'card',
  };
  const method = methodMap[razorpayPayment.method] || 'card';

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      status: 'completed',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      method,
    },
    { new: true }
  );

  if (!payment) {
    return next(new AppError('Payment record not found', 404));
  }

  return sendSuccess(res, 200, {
    payment,
    message: 'Payment verified and completed successfully',
  }, 'Payment successful');
});

// ─── POST /api/payments/cash ──────────────────────────────────────────────
// Record a cash payment (no Razorpay needed)
const recordCashPayment = asyncHandler(async (req, res, next) => {
  const { rideId } = req.body;

  if (!rideId) return next(new AppError('Ride ID is required', 400));

  const ride = await Ride.findById(rideId);
  if (!ride) return next(new AppError('Ride not found', 404));

  if (ride.riderId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (ride.status !== 'completed') {
    return next(new AppError('Ride must be completed before payment', 400));
  }

  const existingPayment = await Payment.findOne({ rideId, status: 'completed' });
  if (existingPayment) {
    return next(new AppError('Ride already paid', 400));
  }

  const payment = await Payment.create({
    rideId,
    riderId: req.user._id,
    amount: ride.finalFare || ride.fare,
    currency: 'INR',
    status: 'completed',
    method: 'cash',
  });

  return sendSuccess(res, 201, { payment }, 'Cash payment recorded');
});

// ─── GET /api/payments/ride/:rideId ──────────────────────────────────────
// Get payment details for a specific ride
const getPaymentByRide = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findOne({ rideId: req.params.rideId })
    .populate('rideId')
    .populate('riderId', 'name email');

  if (!payment) {
    return sendSuccess(res, 200, null, 'No payment found for this ride');
  }

  return sendSuccess(res, 200, payment);
});

// ─── GET /api/payments/my ─────────────────────────────────────────────────
// Get current rider's payment history
const getMyPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { riderId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'rideId',
        select: 'pickup destination fare finalFare status createdAt',
      })
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return sendPaginated(res, payments, total, page, limit);
});

// ─── GET /api/payments ────────────────────────────────────────────────────
// Admin: get all payments
const getAllPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('riderId', 'name email')
      .populate('rideId', 'pickup destination fare status')
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return sendPaginated(res, payments, total, page, limit);
});

// ─── POST /api/payments/refund ────────────────────────────────────────────
// Admin: initiate refund for a payment
const refundPayment = asyncHandler(async (req, res, next) => {
  const { paymentId, reason } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) return next(new AppError('Payment not found', 404));

  if (payment.status !== 'completed') {
    return next(new AppError('Only completed payments can be refunded', 400));
  }

  if (!payment.razorpayPaymentId) {
    return next(new AppError('No Razorpay payment ID found. Cannot refund.', 400));
  }

  // Initiate refund via Razorpay
  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    amount: payment.amount * 100,
    notes: { reason: reason || 'Refund initiated by admin' },
  });

  payment.status = 'refunded';
  await payment.save();

  return sendSuccess(res, 200, { refund, payment }, 'Refund initiated successfully');
});

module.exports = {
  createOrder,
  verifyPayment,
  recordCashPayment,
  getPaymentByRide,
  getMyPayments,
  getAllPayments,
  refundPayment,
};