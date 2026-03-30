const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadAvatar, optimizeImage, handleUploadError } = require('../middleware/upload');
const {
  register,
  login,
  getMe,
  updateProfile,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', validate.register, validate.handleValidationErrors, register);
router.post('/login', validate.login, validate.handleValidationErrors, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.put(
  '/profile',
  protect,
  uploadAvatar.single('avatar'),
  optimizeImage,
  handleUploadError,
  validate.profileUpdate,
  validate.handleValidationErrors,
  updateProfile
);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
