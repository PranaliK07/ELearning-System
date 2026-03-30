const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRoleAccess,
  saveRoleAccess,
  getSystemStats,
  getUserAnalytics,
  getContentAnalytics,
  getPlatformMetrics,
  getClassCommunications,
  sendClassCommunication,
  manageUser,
  manageContent,
  createAnnouncement,
  getReports,
  resolveReport,
  getSystemLogs,
  backupDatabase,
  restoreDatabase
} = require('../controllers/adminController');
const { createUser, linkParent } = require('../controllers/userController');

router.use(protect);

// Business settings: everyone logged-in can read; only admin can write
router.get('/role-access', getRoleAccess);
router.post('/role-access', authorize('admin'), saveRoleAccess);

// All routes below require admin authentication
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getSystemStats);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/content', getContentAnalytics);
router.get('/metrics', getPlatformMetrics);

// Class communication (admin)
router.get('/communications', getClassCommunications);
router.post('/communications', sendClassCommunication);

// User management
router.post('/users/:id/manage', manageUser);
router.post('/users', createUser);
router.patch('/users/:id/link-parent', linkParent);

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
