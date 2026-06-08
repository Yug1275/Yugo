const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(protect);

router.get('/',                   getNotifications);
router.get('/unread-count',       getUnreadCount);
router.put('/read-all',           markAllAsRead);
router.delete('/',                clearAllNotifications);
router.put('/:id/read',           markAsRead);
router.delete('/:id',             deleteNotification);

module.exports = router;
