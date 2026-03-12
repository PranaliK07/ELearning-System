const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicContents,
  getTopicQuizzes,
  reorderTopics
} = require('../controllers/topicController');

// All routes require authentication
router.use(protect);

// Public topic routes
router.get('/', getTopics);
router.get('/:id', getTopic);
router.get('/:id/contents', getTopicContents);
router.get('/:id/quizzes', getTopicQuizzes);

// Teacher and Admin routes
router.post('/', authorize('teacher', 'admin'), validate.topic, validate.handleValidationErrors, createTopic);
router.put('/:id', authorize('teacher', 'admin'), validate.topic, validate.handleValidationErrors, updateTopic);
router.delete('/:id', authorize('admin'), deleteTopic);
router.post('/reorder', authorize('teacher', 'admin'), reorderTopics);

module.exports = router;