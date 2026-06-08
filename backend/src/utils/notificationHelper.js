const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {string} userId - The user's ObjectId
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - 'ride_update' | 'payment' | 'promo' | 'system'
 * @param {string|null} relatedId - Optional related ride/payment ID
 */
const createNotification = async (userId, title, message, type = 'system', relatedId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId: relatedId || null,
      read: false,
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

/**
 * Create notification and emit via Socket.IO in real time
 * @param {object} io - Socket.IO server instance
 * @param {string} userId - Target user ID
 * @param {string} title
 * @param {string} message
 * @param {string} type
 * @param {string|null} relatedId
 */
const sendNotification = async (io, userId, title, message, type = 'system', relatedId = null) => {
  if (!userId) return null;

  const notification = await createNotification(userId, title, message, type, relatedId);

  if (notification && io) {
    // Emit to user's personal socket room
    io.to(`user:${userId.toString()}`).emit('notification:new', {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      relatedId: notification.relatedId,
      read: false,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

module.exports = { createNotification, sendNotification };
