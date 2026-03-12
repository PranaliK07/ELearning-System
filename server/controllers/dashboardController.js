const { User, Progress, Content, Achievement, Announcement } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: ['Grade']
    });

    // Get continue watching
    const continueWatching = await Progress.findAll({
      where: {
        UserId: userId,
        completed: false
      },
      include: [{
        model: Content,
        where: { isPublished: true }
      }],
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    // Get recent achievements
    const recentAchievements = await user.getAchievements({
      limit: 3,
      order: [['UserAchievements.earnedAt', 'DESC']]
    });

    // Get recommended content based on grade
    const recommended = await Content.findAll({
      where: { isPublished: true },
      include: [{
        model: Topic,
        include: [{
          model: Subject,
          where: { GradeId: user.grade }
        }]
      }],
      limit: 6,
      order: [['views', 'DESC']]
    });

    // Get weekly stats
    const weekStart = moment().startOf('week').toDate();
    const weeklyProgress = await Progress.count({
      where: {
        UserId: userId,
        completed: true,
        updatedAt: { [Op.gte]: weekStart }
      }
    });

    const watchTime = await WatchTime.sum('minutes', {
      where: {
        UserId: userId,
        date: { [Op.gte]: weekStart }
      }
    });

    // Get announcements
    const announcements = await Announcement.findAll({
      where: {
        [Op.or]: [
          { targetRole: 'all' },
          { targetRole: req.user.role }
        ],
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['pinned', 'DESC'], ['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      user: user.getPublicProfile(),
      stats: {
        points: user.points,
        streak: user.streak,
        weeklyProgress,
        watchTime: watchTime || 0,
        totalWatchTime: user.totalWatchTime
      },
      continueWatching,
      recentAchievements,
      recommended,
      announcements
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher's classes
    const classes = await Class.findAll({
      where: { teacherId },
      include: [{
        model: User,
        as: 'students',
        attributes: ['id', 'name', 'avatar']
      }]
    });

    // Get recent submissions
    const recentSubmissions = await Submission.findAll({
      where: { teacherId },
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get class performance stats
    const stats = {
      totalStudents: 0,
      pendingReviews: 0,
      averageProgress: 0
    };

    classes.forEach(c => {
      stats.totalStudents += c.students?.length || 0;
    });

    res.json({
      classes,
      recentSubmissions,
      stats
    });
  } catch (error) {
    console.error('Get teacher dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    // Get platform stats
    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalTeachers = await User.count({ where: { role: 'teacher' } });
    const totalContent = await Content.count();
    const totalQuizzes = await Quiz.count();

    // Get recent users
    const recentUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get popular content
    const popularContent = await Content.findAll({
      order: [['views', 'DESC']],
      limit: 5
    });

    // Get system health
    const systemHealth = {
      database: 'healthy',
      storage: 'good',
      lastBackup: '2024-01-15'
    };

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalContent,
        totalQuizzes
      },
      recentUsers,
      popularContent,
      systemHealth
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Progress.findAll({
      where: { UserId: userId },
      include: [Content],
      order: [['updatedAt', 'DESC']],
      limit: 10
    });

    res.json(activities);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getContinueWatching = async (req, res) => {
  try {
    const continueWatching = await Progress.findAll({
      where: {
        UserId: req.user.id,
        completed: false
      },
      include: [Content],
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    res.json(continueWatching);
  } catch (error) {
    console.error('Get continue watching error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecommendedForYou = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    const recommended = await Content.findAll({
      where: { isPublished: true },
      include: [{
        model: Topic,
        include: [{
          model: Subject,
          where: { GradeId: user.grade }
        }]
      }],
      limit: 6,
      order: [['views', 'DESC']]
    });

    res.json(recommended);
  } catch (error) {
    console.error('Get recommended error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: {
        [Op.or]: [
          { targetRole: 'all' },
          { targetRole: req.user.role }
        ],
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['pinned', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuickStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = {
      points: req.user.points,
      streak: req.user.streak,
      completedLessons: await Progress.count({
        where: { UserId: userId, completed: true }
      }),
      achievements: await req.user.countAchievements(),
      watchTime: req.user.totalWatchTime
    };

    res.json(stats);
  } catch (error) {
    console.error('Get quick stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
  getRecentActivity,
  getContinueWatching,
  getRecommendedForYou,
  getAnnouncements,
  getQuickStats
};