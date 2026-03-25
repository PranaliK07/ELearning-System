const { Op } = require('sequelize');
const { User, Progress, Content, Topic, Subject, WatchTime } = require('../models');

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const buildDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
};

const getReportProgressRows = async (start, end) => {
  return Progress.findAll({
    attributes: ['id', 'UserId', 'completed', 'completedAt', 'quizScore', 'lastWatched', 'updatedAt'],
    where: {
      [Op.or]: [
        { updatedAt: { [Op.between]: [start, end] } },
        { completedAt: { [Op.between]: [start, end] } },
        { lastWatched: { [Op.between]: [start, end] } }
      ]
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'role', 'lastActive'],
        required: false
      },
      {
        model: Content,
        attributes: ['id', 'type'],
        required: false,
        include: [
          {
            model: Topic,
            attributes: ['id', 'name'],
            required: false,
            include: [{ model: Subject, attributes: ['id', 'name'], required: false }]
          }
        ]
      }
    ]
  });
};

const buildStudentProgress = (rows, limit = 10) => {
  const perStudent = new Map();

  rows.forEach((row) => {
    const user = row.User;
    if (!user || user.role !== 'student') return;

    if (!perStudent.has(user.id)) {
      perStudent.set(user.id, {
        userId: user.id,
        name: user.name,
        total: 0,
        completed: 0,
        quizSum: 0,
        quizCount: 0,
        lastActive: user.lastActive
      });
    }

    const agg = perStudent.get(user.id);
    agg.total += 1;
    if (row.completed) agg.completed += 1;
    if (row.quizScore !== null && row.quizScore !== undefined) {
      agg.quizSum += toNumber(row.quizScore);
      agg.quizCount += 1;
    }
  });

  return [...perStudent.values()]
    .map((s) => {
      const score = s.quizCount > 0 ? Math.round(s.quizSum / s.quizCount) : 0;
      const progress = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
      return {
        userId: s.userId,
        name: s.name,
        score,
        progress,
        lastActive: s.lastActive
      };
    })
    .sort((a, b) => b.score - a.score || b.progress - a.progress)
    .slice(0, limit);
};

const buildDayActivity = (rows, start, end) => {
  const dayMap = new Map();

  rows.forEach((row) => {
    if (!row.lastWatched || !row.UserId) return;
    const key = new Date(row.lastWatched).toISOString().slice(0, 10);
    if (!dayMap.has(key)) dayMap.set(key, new Set());
    dayMap.get(key).add(row.UserId);
  });

  const result = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({
      day: cursor.toLocaleDateString('en-US', { weekday: 'short' }),
      date: key,
      active: dayMap.has(key) ? dayMap.get(key).size : 0
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

const countVideosWatched = (rows, start, end) =>
  rows.filter((row) => {
    const d = row.lastWatched ? new Date(row.lastWatched) : null;
    return d && d >= start && d <= end && row.Content && row.Content.type === 'video';
  }).length;

const countCompletedTopics = (rows, start, end) =>
  rows.filter((row) => {
    const d = row.completedAt ? new Date(row.completedAt) : null;
    return row.completed && d && d >= start && d <= end;
  }).length;

const getAverageProgressPerStudent = (rows) => {
  const students = buildStudentProgress(rows, Number.MAX_SAFE_INTEGER);
  if (!students.length) return 0;
  const avg = students.reduce((sum, s) => sum + toNumber(s.progress), 0) / students.length;
  return Math.round(avg * 10) / 10;
};

const getMostActiveSubject = (rows, start, end) => {
  const activity = new Map();

  rows.forEach((row) => {
    const d = row.lastWatched ? new Date(row.lastWatched) : null;
    const subject = row.Content?.Topic?.Subject;
    if (!d || d < start || d > end) return;
    if (!subject?.name) return;
    if (row.Content?.type !== 'video') return;
    activity.set(subject.name, (activity.get(subject.name) || 0) + 1);
  });

  if (!activity.size) return null;

  let bestName = null;
  let bestCount = -1;
  activity.forEach((count, name) => {
    if (count > bestCount) {
      bestCount = count;
      bestName = name;
    }
  });

  return { name: bestName, activityCount: bestCount };
};

const getTotalWatchHours = async (start, end) => {
  const minutes = await WatchTime.sum('minutes', {
    where: { date: { [Op.between]: [start, end] } }
  });
  return Math.round((toNumber(minutes) / 60) * 10) / 10;
};

const getDailyReport = async (req, res) => {
  try {
    const { start, end } = buildDateRange(1);
    const [rows, totalHours, activeStudents, newEnrollmentsToday] = await Promise.all([
      getReportProgressRows(start, end),
      getTotalWatchHours(start, end),
      User.count({
        where: {
          role: 'student',
          isActive: true,
          lastActive: { [Op.between]: [start, end] }
        }
      }),
      User.count({
        where: {
          role: 'student',
          createdAt: { [Op.between]: [start, end] }
        }
      })
    ]);

    const studentProgress = buildStudentProgress(rows, 10);
    const avgScore = studentProgress.length
      ? Math.round((studentProgress.reduce((sum, s) => sum + s.score, 0) / studentProgress.length) * 10) / 10
      : 0;
    const avgProgress = getAverageProgressPerStudent(rows);

    res.json({
      period: 'daily',
      range: { start, end },
      summary: {
        activeStudentsToday: activeStudents,
        videosWatchedToday: countVideosWatched(rows, start, end),
        topicsCompletedToday: countCompletedTopics(rows, start, end),
        newEnrollmentsToday
      },
      performanceMetrics: {
        avgScore,
        completionRate: `${Math.round(avgProgress)}%`,
        totalHours
      },
      studentProgress,
      weeklyActivity: buildDayActivity(rows, start, end)
    });
  } catch (error) {
    console.error('Get daily report error:', error);
    res.status(500).json({ message: 'Failed to generate daily report' });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const { start, end } = buildDateRange(7);
    const [rows, totalHours, activeUsersThisWeek] = await Promise.all([
      getReportProgressRows(start, end),
      getTotalWatchHours(start, end),
      User.count({
        where: {
          role: 'student',
          isActive: true,
          lastActive: { [Op.between]: [start, end] }
        }
      })
    ]);

    const averageProgressPerStudent = getAverageProgressPerStudent(rows);
    const mostActiveSubject = getMostActiveSubject(rows, start, end);
    const studentProgress = buildStudentProgress(rows, 10);
    const avgScore = studentProgress.length
      ? Math.round((studentProgress.reduce((sum, s) => sum + s.score, 0) / studentProgress.length) * 10) / 10
      : 0;

    res.json({
      period: 'weekly',
      range: { start, end },
      summary: {
        totalActiveUsersThisWeek: activeUsersThisWeek,
        totalVideosWatched: countVideosWatched(rows, start, end),
        averageProgressPerStudent,
        mostActiveSubject: mostActiveSubject ? mostActiveSubject.name : 'N/A'
      },
      performanceMetrics: {
        avgScore,
        completionRate: `${Math.round(averageProgressPerStudent)}%`,
        totalHours
      },
      studentProgress,
      weeklyActivity: buildDayActivity(rows, start, end)
    });
  } catch (error) {
    console.error('Get weekly report error:', error);
    res.status(500).json({ message: 'Failed to generate weekly report' });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const { start, end } = buildDateRange(30);
    const [rows, totalHours, totalUsers] = await Promise.all([
      getReportProgressRows(start, end),
      getTotalWatchHours(start, end),
      User.count()
    ]);

    const topPerformingStudents = buildStudentProgress(rows, 5);
    const total = rows.length;
    const completed = rows.filter((row) => row.completed).length;
    const overallProgressPercentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;
    const averageProgressPerStudent = getAverageProgressPerStudent(rows);
    const avgScore = topPerformingStudents.length
      ? Math.round((topPerformingStudents.reduce((sum, s) => sum + s.score, 0) / topPerformingStudents.length) * 10) / 10
      : 0;

    res.json({
      period: 'monthly',
      range: { start, end },
      summary: {
        totalUsers,
        totalCompletedTopics: countCompletedTopics(rows, start, end),
        totalVideosWatched: countVideosWatched(rows, start, end),
        topPerformingStudents,
        overallProgressPercentage
      },
      performanceMetrics: {
        avgScore,
        completionRate: `${Math.round(averageProgressPerStudent)}%`,
        totalHours
      },
      studentProgress: topPerformingStudents,
      weeklyActivity: buildDayActivity(rows, start, end)
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ message: 'Failed to generate monthly report' });
  }
};

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport
};
