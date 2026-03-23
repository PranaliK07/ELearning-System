const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectTopics,
  getSubjectStats
} = require('../controllers/subjectController');

// All routes require authentication
router.use(protect);

// Public subject routes
router.get('/', getSubjects);
router.get('/:id', getSubject);
router.get('/:id/topics', getSubjectTopics);
router.get('/:id/stats', getSubjectStats);

// Teacher and Admin routes
router.post('/', authorize('teacher', 'admin'), validate.subject, validate.handleValidationErrors, createSubject);
router.put('/:id', authorize('teacher', 'admin'), updateSubject);
router.delete('/:id', authorize('teacher', 'admin'), deleteSubject);

module.exports = router;
