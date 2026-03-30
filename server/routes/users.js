const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserProgress,
  getUserAchievements,
  toggleUserStatus,
  linkParent,
  getTeachers,
  getStudents
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Public user routes (authenticated users can access)
router.get('/teachers', getTeachers);
router.get('/students', getStudents);
router.get('/stats/:id', getUserStats);
router.get('/progress/:id', getUserProgress);
router.get('/achievements/:id', getUserAchievements);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), validate.profileUpdate, validate.handleValidationErrors, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.patch('/:id/status', authorize('admin'), toggleUserStatus);
router.patch('/:id/link-parent', authorize('admin'), linkParent);

module.exports = router;
