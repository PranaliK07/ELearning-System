const { User, Achievement, sequelize } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { normalizeRole } = require('../utils/roles');

const DEMO_TRIAL_DAYS = 5;
const DEMO_TRIAL_MS = DEMO_TRIAL_DAYS * 24 * 60 * 60 * 1000;

const buildDemoTrialWindow = (enabled) => {
  if (!enabled) {
    return {};
  }

  const trialStartsAt = new Date();
  const trialEndsAt = new Date(trialStartsAt.getTime() + DEMO_TRIAL_MS);

  return { trialStartsAt, trialEndsAt };
};

const normalizeOptionalText = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
};

const normalizeOptionalGrade = (value, role) => {
  if (normalizeRole(role) === 'demo') {
    return null;
  }

  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const gradeNumber = Number(value);
  return Number.isFinite(gradeNumber) ? gradeNumber : value;
};

const isDemoExpired = (user) => {
  if (normalizeRole(user?.role) !== 'demo' || !user?.trialEndsAt) {
    return false;
  }

  const trialEndsAt = new Date(user.trialEndsAt).getTime();
  return Number.isFinite(trialEndsAt) && trialEndsAt <= Date.now();
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, middleName, lastName, email, password, role, grade, parentPhone, parentEmail } = req.body;
    const firstNameText = String(firstName || '').trim();
    const middleNameText = String(middleName || '').trim();
    const lastNameText = String(lastName || '').trim();
    const name = `${firstNameText} ${middleNameText ? `${middleNameText} ` : ''}${lastNameText}`.trim();


    const normalizedRole = normalizeRole(role || 'student');
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedParentEmail = normalizeOptionalText(parentEmail)?.toLowerCase() || null;

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user (and parent link for student) atomically
    const user = await sequelize.transaction(async (t) => {
      // Check if user exists (allow restore if soft-deleted)
      const userExists = await User.findOne({ where: { email: normalizedEmail }, transaction: t });
      if (userExists && !userExists.isDeleted) {
        throw Object.assign(new Error('User already exists'), { statusCode: 400 });
      }

      let linkedParent = null;

      if (normalizedRole === 'student' && normalizedParentEmail) {
        const existingByParentEmail = await User.findOne({ where: { email: normalizedParentEmail }, transaction: t });
        if (existingByParentEmail && existingByParentEmail.role !== 'parent') {
          throw Object.assign(new Error('Parent email is already used by another account'), { statusCode: 400 });
        }

        if (existingByParentEmail) {
          if (existingByParentEmail.isDeleted) {
            existingByParentEmail.isDeleted = false;
            existingByParentEmail.isActive = true;
          }
          if (!existingByParentEmail.parentPhone && typeof parentPhone === 'string' && parentPhone.trim()) {
            existingByParentEmail.parentPhone = parentPhone.trim();
            await existingByParentEmail.save({ transaction: t });
          }
          linkedParent = existingByParentEmail;
        } else {
          const temporaryPassword = crypto.randomBytes(6).toString('hex');
          linkedParent = await User.create({
            name: `Parent of ${String(firstName || 'Student').trim()}`,
            firstName: 'Parent',
            middleName: '',
            lastName: lastName || 'Student',
            email: normalizedParentEmail,
            password: temporaryPassword,
            role: 'parent',
            parentPhone: typeof parentPhone === 'string' && parentPhone.trim() ? parentPhone.trim() : null,
            isActive: true
          }, { transaction: t });
        }
      }

      const nextValues = {
        name,
        firstName: firstNameText,
        middleName: middleNameText,
        lastName: lastNameText,
        email: normalizedEmail,
        password,
        role: normalizedRole,
        grade: normalizeOptionalGrade(grade, normalizedRole),
        verificationToken,
        parentPhone: normalizeOptionalText(parentPhone),
        parentEmail: normalizedParentEmail,
        ParentId: linkedParent ? linkedParent.id : null,

        isActive: true,
        isDeleted: false,
        emailVerified: false,
        ...buildDemoTrialWindow(normalizedRole === 'demo')
      };

      if (userExists && userExists.isDeleted) {
        userExists.set(nextValues);
        // Clear any reset tokens so the restored account is clean
        userExists.resetPasswordToken = null;
        userExists.resetPasswordExpire = null;
        await userExists.save({ transaction: t });
        return userExists;
      }

      return User.create(nextValues, { transaction: t });
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      template: 'verification',
      data: { name: user.name, verificationUrl }
    });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Award welcome achievement
    const welcomeAchievement = await Achievement.findOne({
      where: { name: 'First Steps' }
    });
    if (welcomeAchievement) {
      await user.addAchievement(welcomeAchievement);
    }

    res.status(201).json({
      success: true,
      ...user.getPublicProfile(),
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error?.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isDeleted) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (isDemoExpired(user)) {
      user.isActive = false;
      await user.save({ fields: ['isActive'] });
      return res.status(403).json({ message: 'Demo access expired. Please contact admin.' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    


    // Update last active and streak
    const today = new Date().toDateString();
    const lastActive = user.lastActive ? new Date(user.lastActive).toDateString() : null;

    if (lastActive !== today) {
      if (lastActive === new Date(Date.now() - 86400000).toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
    }

    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      ...user.getPublicProfile(),
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [
        {
          model: Achievement,
          required: false,
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error details:', {
      userId: req.user?.id,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error loading profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, middleName, lastName, grade, bio, parentPhone, parentEmail } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (middleName !== undefined) user.middleName = middleName;
    if (lastName !== undefined) user.lastName = lastName;
    
    if (firstName || lastName) {
      const fName = firstName || user.firstName || '';
      const mName = middleName || user.middleName || '';
      const lName = lastName || user.lastName || '';
      user.name = `${fName} ${mName ? mName + ' ' : ''}${lName}`.trim();
    }

    if (grade !== undefined) {
      const trimmedGrade = typeof grade === 'string' ? grade.trim() : grade;
      if (trimmedGrade === '' || trimmedGrade === null || trimmedGrade === 'null') {
        user.grade = null;
      } else {
        const parsedGrade = Number.parseInt(trimmedGrade, 10);
        user.grade = Number.isNaN(parsedGrade) ? user.grade : parsedGrade;
      }
    }

    if (typeof bio === 'string') user.bio = bio;
    if (parentPhone !== undefined) user.parentPhone = parentPhone;
    if (parentEmail !== undefined) user.parentEmail = parentEmail;

    // Handle avatar upload
    if (req.file) {
      console.log('Received file for avatar:', req.file.filename);
      user.setDataValue('avatar', req.file.filename);
      user.changed('avatar', true);
    }

    await user.save();

    // Fetch updated user with inclusions
    const updatedUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: Achievement,
          through: { attributes: [] }
        }
      ]
    });

    const publicUser = updatedUser.getPublicProfile();
    console.log('Returning updated avatar:', publicUser.avatar);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: publicUser,
      achievements: updatedUser.Achievements || []
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'resetPassword',
      data: { name: user.name, resetUrl }
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
