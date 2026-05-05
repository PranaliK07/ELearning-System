const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDailyReport, getWeeklyReport, getMonthlyReport, getStudentsProgress } = require('../controllers/reportsController');

router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/students', getStudentsProgress);

const reportHandlerByPeriod = {
  daily: getDailyReport,
  weekly: getWeeklyReport,
  monthly: getMonthlyReport
};

// Backward-compatible endpoint:
// - GET /api/reports
// - GET /api/reports?period=daily|weekly|monthly
router.get('/', (req, res, next) => {
  const period = (req.query.period || 'daily').toString().toLowerCase();
  const handler = reportHandlerByPeriod[period];

  if (!handler) {
    return res.status(400).json({
      message: "Invalid period. Use 'daily', 'weekly', or 'monthly'."
    });
  }

  return handler(req, res, next);
});

router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);

// Alias endpoint:
// - GET /api/reports/:period
router.get('/:period', (req, res, next) => {
  const period = (req.params.period || '').toLowerCase();
  const handler = reportHandlerByPeriod[period];

  if (!handler) {
    return res.status(404).json({
      message: 'Report period not found'
    });
  }

  return handler(req, res, next);
});

module.exports = router;
