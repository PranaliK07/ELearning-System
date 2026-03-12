const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitQuiz,
  getQuizResults,
  getQuizLeaderboard,
  getQuizStats
} = require('../controllers/quizController');

// All routes require authentication
router.use(protect);

// Public quiz routes
router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.get('/:id/results', getQuizResults);
router.get('/:id/leaderboard', getQuizLeaderboard);
router.get('/:id/stats', getQuizStats);

// Quiz taking routes
router.post('/:id/start', startQuiz);
router.post('/:id/submit', submitQuiz);

// Teacher and Admin routes
router.post('/', authorize('teacher', 'admin'), validate.quiz, validate.handleValidationErrors, createQuiz);
router.put('/:id', authorize('teacher', 'admin'), validate.quiz, validate.handleValidationErrors, updateQuiz);
router.delete('/:id', authorize('teacher', 'admin'), deleteQuiz);

module.exports = router;