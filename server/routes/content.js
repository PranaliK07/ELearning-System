const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  getContentProgress,
  incrementViews,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  toggleBookmark,
  getRecommendedContent,
  getTrendingContent,
  searchContent
} = require('../controllers/contentController');

// All routes require authentication
router.use(protect);

// Public content routes
router.get('/', getContents);
router.get('/recommended', getRecommendedContent);
router.get('/trending', getTrendingContent);
router.get('/search', searchContent);
router.get('/:id', getContent);
router.get('/:id/progress', getContentProgress);
router.get('/:id/comments', getComments);

// Interaction routes
router.post('/:id/view', incrementViews);
router.post('/:id/like', toggleLike);
router.post('/:id/bookmark', toggleBookmark);
router.post('/:id/comment', validate.comment, validate.handleValidationErrors, addComment);
router.delete('/:id/comment/:commentId', deleteComment);

// Teacher and Admin routes
router.post('/', authorize('teacher', 'admin'), validate.content, validate.handleValidationErrors, createContent);
router.put('/:id', authorize('teacher', 'admin'), validate.content, validate.handleValidationErrors, updateContent);
router.delete('/:id', authorize('teacher', 'admin'), deleteContent);

module.exports = router;