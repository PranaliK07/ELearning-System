const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyClasses,
  getMyStudents,
  getStudentDetails,
  createAssignment,
  gradeAssignment,
  provideFeedback,
  getClassProgress,
  getSubjectProgress,
  createAnnouncement,
  getPendingReviews
} = require('../controllers/teacherController');

// All routes require teacher authentication
router.use(protect);
router.use(authorize('teacher'));

// Class management
router.get('/classes', getMyClasses);
router.get('/students', getMyStudents);
router.get('/students/:id', getStudentDetails);
router.get('/progress/class/:classId', getClassProgress);
router.get('/progress/subject/:subjectId', getSubjectProgress);

// Assignment management
router.post('/assignments', createAssignment);
router.post('/assignments/:id/grade', gradeAssignment);
router.post('/feedback/:studentId', provideFeedback);

// Announcements
router.post('/announcements', createAnnouncement);

// Reviews
router.get('/pending-reviews', getPendingReviews);

module.exports = router;