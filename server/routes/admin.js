const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSystemStats,
  getUserAnalytics,
  getContentAnalytics,
  getPlatformMetrics,
  manageUser,
  manageContent,
  createAnnouncement,
  getReports,
  resolveReport,
  getSystemLogs,
  backupDatabase,
  restoreDatabase
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getSystemStats);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/content', getContentAnalytics);
router.get('/metrics', getPlatformMetrics);

// User management
router.post('/users/:id/manage', manageUser);

// Content management
router.post('/content/:id/manage', manageContent);

// Announcements
router.post('/announcements', createAnnouncement);

// Reports
router.get('/reports', getReports);
router.post('/reports/:id/resolve', resolveReport);

// System
router.get('/logs', getSystemLogs);
router.post('/backup', backupDatabase);
router.post('/restore', restoreDatabase);

module.exports = router;