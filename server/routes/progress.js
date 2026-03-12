const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    updateProgress,
    getProgress,
    getGradeProgress,
    getWatchTimeStats
} = require('../controllers/progressController');
const { getRecentActivity } = require('../controllers/dashboardController');
const { submitQuiz: submitQuizResult } = require('../controllers/quizController');


// All routes require authentication
router.use(protect);

router.get('/', getProgress);
router.post('/update', updateProgress);
router.get('/watchtime', getWatchTimeStats);
router.get('/recent', getRecentActivity);
router.get('/grade/:gradeId', getGradeProgress);
router.post('/quiz/:quizId', submitQuizResult);



module.exports = router;
