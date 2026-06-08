const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated, getPagination } = require('../utils/responseHelper');

// ─── GET /api/notifications ───────────────────────────────────────────────
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { userId: req.user._id };
  if (req.query.unread === 'true') filter.read = false;
  if (req.query.type) filter.type = req.query.type;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  return res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

// ─── GET /api/notifications/unread-count ─────────────────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });
  return sendSuccess(res, 200, { count });
});

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────
const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) return next(new AppError('Notification not found', 404));

  notification.read = true;
  await notification.save();

  return sendSuccess(res, 200, notification, 'Marked as read');
});

// ─── PUT /api/notifications/read-all ─────────────────────────────────────
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { read: true }
  );
  return sendSuccess(res, 200, {}, 'All notifications marked as read');
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────
const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) return next(new AppError('Notification not found', 404));

  await notification.deleteOne();
  return sendSuccess(res, 200, {}, 'Notification deleted');
});

// ─── DELETE /api/notifications ────────────────────────────────────────────
const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });
  return sendSuccess(res, 200, {}, 'All notifications cleared');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
