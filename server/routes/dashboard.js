const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
  getRecentActivity,
  getContinueWatching,
  getRecommendedForYou,
  getAnnouncements,
  getQuickStats
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(protect);

// Dashboard routes based on role
router.get('/student', getStudentDashboard);
router.get('/teacher', getTeacherDashboard);
router.get('/admin', getAdminDashboard);

// Common dashboard components
router.get('/recent-activity', getRecentActivity);
router.get('/continue-watching', getContinueWatching);
router.get('/recommended', getRecommendedForYou);
router.get('/announcements', getAnnouncements);
router.get('/stats', getQuickStats);

module.exports = router;