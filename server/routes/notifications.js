const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationSettings,
  updateNotificationSettings
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// Notification routes
router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;