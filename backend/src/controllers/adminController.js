const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated, getPagination } = require('../utils/responseHelper');
const { sendNotification } = require('../utils/notificationHelper');

// ─── GET /api/admin/stats ─────────────────────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalDrivers,
    approvedDrivers,
    pendingDrivers,
    totalRides,
    todayRides,
    weekRides,
    completedRides,
    cancelledRides,
    totalPayments,
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'rider' }),
    Driver.countDocuments(),
    Driver.countDocuments({ isApproved: true }),
    Driver.countDocuments({ isApproved: false }),
    Ride.countDocuments(),
    Ride.countDocuments({ createdAt: { $gte: todayStart } }),
    Ride.countDocuments({ createdAt: { $gte: weekStart } }),
    Ride.countDocuments({ status: 'completed' }),
    Ride.countDocuments({ status: 'cancelled' }),
    Payment.countDocuments({ status: 'completed' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return sendSuccess(res, 200, {
    users: {
      total: totalUsers,
    },
    drivers: {
      total: totalDrivers,
      approved: approvedDrivers,
      pending: pendingDrivers,
    },
    rides: {
      total: totalRides,
      today: todayRides,
      week: weekRides,
      completed: completedRides,
      cancelled: cancelledRides,
      completionRate: totalRides > 0
        ? Math.round((completedRides / totalRides) * 100)
        : 0,
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      today: todayRevenue[0]?.total || 0,
      week: weekRevenue[0]?.total || 0,
      month: monthRevenue[0]?.total || 0,
      transactions: totalPayments,
    },
  });
});

// ─── GET /api/admin/analytics/rides ───────────────────────────────────────
const getRideAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Daily rides trend
  const dailyRides = await Ride.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
          day:   { $dayOfMonth: '$createdAt' },
        },
        total:     { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        revenue:   { $sum: { $ifNull: ['$finalFare', '$fare'] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Format for chart
  const formatted = dailyRides.map((d) => ({
    date: `${d._id.day}/${d._id.month}`,
    total: d.total,
    completed: d.completed,
    cancelled: d.cancelled,
    revenue: d.revenue,
  }));

  // Status breakdown
  const statusBreakdown = await Ride.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Hourly distribution (peak hours)
  const hourlyRides = await Ride.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
    { $sort: { '_id': 1 } },
  ]);

  const hourlyFormatted = hourlyRides.map((h) => ({
    hour: `${h._id}:00`,
    rides: h.count,
  }));

  return sendSuccess(res, 200, {
    daily: formatted,
    statusBreakdown,
    hourly: hourlyFormatted,
  });
});

// ─── GET /api/admin/analytics/revenue ─────────────────────────────────────
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Daily revenue
  const dailyRevenue = await Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
          day:   { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$amount' },
        count:   { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const formatted = dailyRevenue.map((d) => ({
    date: `${d._id.day}/${d._id.month}`,
    revenue: d.revenue,
    transactions: d.count,
  }));

  // Payment method breakdown
  const methodBreakdown = await Payment.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        total: { $sum: '$amount' },
      },
    },
  ]);

  // Top earning drivers
  const topDrivers = await Driver.find()
    .sort({ totalEarnings: -1 })
    .limit(5)
    .populate('userId', 'name email')
    .lean();

  return sendSuccess(res, 200, {
    daily: formatted,
    methodBreakdown,
    topDrivers: topDrivers.map((d) => ({
      name: d.userId?.name || 'Unknown',
      email: d.userId?.email || '',
      totalEarnings: d.totalEarnings,
      totalRides: d.totalRides,
      rating: d.rating,
    })),
  });
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { q = '', role = '' } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (q) {
    filter.$or = [
      { name:  { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')
      .lean(),
    User.countDocuments(filter),
  ]);

  return sendPaginated(res, users, total, page, limit);
});

// ─── PUT /api/admin/users/:id/status ─────────────────────────────────────
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;
  if (isActive === undefined) return next(new AppError('isActive is required', 400));

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) return next(new AppError('User not found', 404));

  return sendSuccess(
    res, 200, user,
    `User ${isActive ? 'activated' : 'deactivated'} successfully`
  );
});

// ─── GET /api/admin/drivers ───────────────────────────────────────────────
const getAllDrivers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { q = '', status = '' } = req.query;

  let userFilter = { role: 'driver' };
  if (q) {
    userFilter.$or = [
      { name:  { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const matchingUsers = await User.find(userFilter).select('_id').lean();
  const userIds = matchingUsers.map((u) => u._id);

  const driverFilter = { userId: { $in: userIds } };
  if (status === 'pending')   driverFilter.isApproved = false;
  if (status === 'approved')  { driverFilter.isApproved = true; driverFilter.isSuspended = false; }
  if (status === 'suspended') driverFilter.isSuspended = true;

  const [drivers, total] = await Promise.all([
    Driver.find(driverFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phone isActive createdAt')
      .lean(),
    Driver.countDocuments(driverFilter),
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

// ─── PUT /api/admin/drivers/:id/approve ──────────────────────────────────
const approveDriver = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id)
    .populate('userId', 'name');
  if (!driver) return next(new AppError('Driver not found', 404));

  driver.isApproved = true;
  driver.isSuspended = false;
  await driver.save();

  // Notify driver
  const io = req.app.get('io');
  await sendNotification(
    io,
    driver.userId._id.toString(),
    '✅ Account Approved!',
    'Congratulations! Your driver account has been approved. You can now go online and accept rides.',
    'system'
  );

  return sendSuccess(res, 200, driver, 'Driver approved successfully');
});

// ─── PUT /api/admin/drivers/:id/suspend ──────────────────────────────────
const suspendDriver = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const driver = await Driver.findById(req.params.id)
    .populate('userId', 'name');
  if (!driver) return next(new AppError('Driver not found', 404));

  driver.isSuspended = true;
  driver.availability = false;
  await driver.save();

  // Notify driver
  const io = req.app.get('io');
  await sendNotification(
    io,
    driver.userId._id.toString(),
    '⛔ Account Suspended',
    reason || 'Your account has been suspended. Please contact support.',
    'system'
  );

  return sendSuccess(res, 200, driver, 'Driver suspended');
});

// ─── PUT /api/admin/drivers/:id/unsuspend ────────────────────────────────
const unsuspendDriver = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id)
    .populate('userId', 'name');
  if (!driver) return next(new AppError('Driver not found', 404));

  driver.isSuspended = false;
  await driver.save();

  const io = req.app.get('io');
  await sendNotification(
    io,
    driver.userId._id.toString(),
    '✅ Account Reinstated',
    'Your driver account has been reinstated. You can now go online.',
    'system'
  );

  return sendSuccess(res, 200, driver, 'Driver unsuspended');
});

// ─── GET /api/admin/rides ─────────────────────────────────────────────────
const getAllRides = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status = '', q = '' } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { 'pickup.address':      { $regex: q, $options: 'i' } },
      { 'destination.address': { $regex: q, $options: 'i' } },
    ];
  }

  const [rides, total] = await Promise.all([
    Ride.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('riderId', 'name email phone')
      .populate({ path: 'driverId', populate: { path: 'userId', select: 'name email' } })
      .lean(),
    Ride.countDocuments(filter),
  ]);

  return sendPaginated(res, rides, total, page, limit);
});

// ─── GET /api/admin/payments ──────────────────────────────────────────────
const getAllPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status = '' } = req.query;

  const filter = {};
  if (status) filter.status = status;

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

// ─── GET /api/admin/export/rides ──────────────────────────────────────────
// Returns rides as CSV-friendly JSON for frontend export
const exportRides = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(endDate);
  }

  const rides = await Ride.find(filter)
    .sort({ createdAt: -1 })
    .limit(5000)
    .populate('riderId', 'name email phone')
    .populate({ path: 'driverId', populate: { path: 'userId', select: 'name email' } })
    .lean();

  const csvData = rides.map((r) => ({
    'Ride ID':         r._id.toString(),
    'Rider Name':      r.riderId?.name || '',
    'Rider Email':     r.riderId?.email || '',
    'Driver Name':     r.driverId?.userId?.name || '',
    'Pickup':          r.pickup?.address || '',
    'Destination':     r.destination?.address || '',
    'Status':          r.status,
    'Fare (INR)':      r.finalFare || r.fare || 0,
    'Distance (km)':   r.distanceKm || '',
    'Duration (min)':  r.durationMin || '',
    'Created At':      new Date(r.createdAt).toLocaleString('en-IN'),
  }));

  return sendSuccess(res, 200, csvData, `${csvData.length} rides exported`);
});

// ─── GET /api/admin/export/payments ──────────────────────────────────────
const exportPayments = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(endDate);
  }

  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .limit(5000)
    .populate('riderId', 'name email')
    .lean();

  const csvData = payments.map((p) => ({
    'Payment ID':       p._id.toString(),
    'Rider Name':       p.riderId?.name || '',
    'Rider Email':      p.riderId?.email || '',
    'Amount (INR)':     p.amount,
    'Status':           p.status,
    'Method':           p.method,
    'Razorpay ID':      p.razorpayPaymentId || '',
    'Created At':       new Date(p.createdAt).toLocaleString('en-IN'),
  }));

  return sendSuccess(res, 200, csvData, `${csvData.length} payments exported`);
});

module.exports = {
  getDashboardStats,
  getRideAnalytics,
  getRevenueAnalytics,
  getAllUsers,
  updateUserStatus,
  getAllDrivers,
  approveDriver,
  suspendDriver,
  unsuspendDriver,
  getAllRides,
  getAllPayments,
  exportRides,
  exportPayments,
};
