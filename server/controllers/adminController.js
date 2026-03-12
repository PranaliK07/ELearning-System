const { User, Content, Quiz, Achievement, Announcement } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const { exec } = require('child_process');

const getSystemStats = async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.count(),
        students: await User.count({ where: { role: 'student' } }),
        teachers: await User.count({ where: { role: 'teacher' } }),
        admins: await User.count({ where: { role: 'admin' } }),
        active: await User.count({ where: { isActive: true } })
      },
      content: {
        total: await Content.count(),
        videos: await Content.count({ where: { type: 'video' } }),
        readings: await Content.count({ where: { type: 'reading' } }),
        quizzes: await Quiz.count()
      },
      achievements: await Achievement.count(),
      storage: {
        videos: getFolderSize('./uploads/videos'),
        thumbnails: getFolderSize('./uploads/thumbnails'),
        avatars: getFolderSize('./uploads/avatars')
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;

    let startDate;
    const today = new Date();

    switch (timeframe) {
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        startDate = new Date(today.setMonth(today.getMonth() - 1));
    }

    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: startDate } }
    });

    const activeUsers = await User.count({
      where: { lastActive: { [Op.gte]: startDate } }
    });

    const usersByGrade = await User.findAll({
      where: { role: 'student' },
      attributes: [
        'grade',
        [sequelize.fn('COUNT', sequelize.col('grade')), 'count']
      ],
      group: ['grade']
    });

    res.json({
      timeframe,
      newUsers,
      activeUsers,
      totalUsers: await User.count(),
      usersByGrade
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getContentAnalytics = async (req, res) => {
  try {
    const popularContent = await Content.findAll({
      attributes: ['id', 'title', 'type', 'views', 'likes'],
      order: [['views', 'DESC']],
      limit: 10
    });

    const contentByType = await Content.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('type')), 'count']
      ],
      group: ['type']
    });

    const totalViews = await Content.sum('views');
    const totalLikes = await Content.sum('likes');

    res.json({
      popularContent,
      contentByType,
      totalViews,
      totalLikes
    });
  } catch (error) {
    console.error('Get content analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlatformMetrics = async (req, res) => {
  try {
    const metrics = {
      engagement: {
        dailyActiveUsers: await User.count({
          where: { lastActive: { [Op.gte]: new Date(Date.now() - 24*60*60*1000) } }
        }),
        weeklyActiveUsers: await User.count({
          where: { lastActive: { [Op.gte]: new Date(Date.now() - 7*24*60*60*1000) } }
        }),
        monthlyActiveUsers: await User.count({
          where: { lastActive: { [Op.gte]: new Date(Date.now() - 30*24*60*60*1000) } }
        })
      },
      performance: {
        averageWatchTime: 0, // Calculate from WatchTime
        completionRate: 0, // Calculate from Progress
        quizPassRate: 0 // Calculate from Progress
      }
    };

    res.json(metrics);
  } catch (error) {
    console.error('Get platform metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const manageUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    switch (action) {
      case 'activate':
        user.isActive = true;
        await user.save();
        break;
      case 'deactivate':
        user.isActive = false;
        await user.save();
        break;
      case 'resetPassword':
        // Implement password reset
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ success: true, message: `User ${action}d successfully` });
  } catch (error) {
    console.error('Manage user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const manageContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const content = await Content.findByPk(id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    switch (action) {
      case 'publish':
        content.isPublished = true;
        await content.save();
        break;
      case 'unpublish':
        content.isPublished = false;
        await content.save();
        break;
      case 'feature':
        // Implement feature flag
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ success: true, message: `Content ${action}d successfully` });
  } catch (error) {
    console.error('Manage content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetRole, targetGrades, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      priority,
      targetRole,
      targetGrades,
      expiresAt,
      authorId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReports = async (req, res) => {
  try {
    // Implement report generation
    const reports = [];

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    // Implement report resolution

    res.json({ success: true, message: 'Report resolved' });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const logFile = './logs/app.log';
    
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8').split('\n').slice(-100);
      res.json(logs);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const backupDatabase = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `./backups/backup-${timestamp}.sql`;
    
    const cmd = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${backupFile}`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup error:', error);
        return res.status(500).json({ message: 'Backup failed' });
      }
      
      res.json({
        success: true,
        message: 'Database backed up successfully',
        file: backupFile
      });
    });
  } catch (error) {
    console.error('Backup database error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const restoreDatabase = async (req, res) => {
  try {
    const { file } = req.body;
    
    const cmd = `mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < ${file}`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Restore error:', error);
        return res.status(500).json({ message: 'Restore failed' });
      }
      
      res.json({
        success: true,
        message: 'Database restored successfully'
      });
    });
  } catch (error) {
    console.error('Restore database error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get folder size
const getFolderSize = (folderPath) => {
  try {
    let totalSize = 0;
    const files = fs.readdirSync(folderPath);
    
    files.forEach(file => {
      const stats = fs.statSync(`${folderPath}/${file}`);
      totalSize += stats.size;
    });
    
    return totalSize;
  } catch (error) {
    return 0;
  }
};

module.exports = {
  getSystemStats,
  getUserAnalytics,
  getContentAnalytics,
  getPlatformMetrics,
  manageUser,
  manageContent,
  createAnnouncement,
  getReports,
  resolveReport,
  getSystemLogs,
  backupDatabase,
  restoreDatabase
};