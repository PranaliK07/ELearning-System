const { User, Progress, Achievement, Grade } = require('../models');
const { Op } = require('sequelize');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [{ model: Grade }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: users.rows,
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [
        { model: Grade },
        { model: Achievement }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, role, grade, isActive } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (grade) user.grade = grade;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete or hard delete? Let's soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const progress = await Progress.findAll({
      where: { UserId: userId },
      include: ['Content']
    });

    const stats = {
      totalWatchTime: progress.reduce((sum, p) => sum + p.watchTime, 0),
      completedLessons: progress.filter(p => p.completed).length,
      totalLessons: progress.length,
      averageQuizScore: progress.filter(p => p.quizScore).reduce((sum, p) => sum + p.quizScore, 0) / 
                       progress.filter(p => p.quizScore).length || 0,
      achievements: await user.countAchievements()
    };

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserProgress = async (req, res) => {
  try {
    const userId = req.params.id;

    const progress = await Progress.findAll({
      where: { UserId: userId },
      include: [{
        model: Content,
        include: [{
          model: Topic,
          include: [Subject]
        }]
      }],
      order: [['updatedAt', 'DESC']]
    });

    res.json(progress);
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [Achievement]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.Achievements);
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher', isActive: true },
      attributes: ['id', 'name', 'email', 'avatar']
    });

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { grade } = req.query;
    const where = { role: 'student', isActive: true };
    
    if (grade) where.grade = grade;

    const students = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'avatar', 'grade', 'points'],
      order: [['name', 'ASC']]
    });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserProgress,
  getUserAchievements,
  toggleUserStatus,
  getTeachers,
  getStudents
};