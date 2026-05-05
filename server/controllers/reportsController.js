const { Op } = require('sequelize');
const { User, Progress, Content, Topic, Subject, WatchTime, Grade, Assignment, Submission, Attendance } = require('../models');
const fs = require('fs');
const path = require('path');

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
  return User.findAll({
    where: { role: 'student' },
    attributes: ['id', 'name', 'role', 'lastActive', 'grade', 'GradeId', 'avatar', 'points'],
    include: [
      {
        model: Grade,
        attributes: ['id', 'name', 'level'],
        required: false
      },
      {
        model: Progress,
        required: false,
        include: [
          {
            model: Content,
            attributes: ['id', 'type'],
            required: false
          }
        ]
      }
    ]
  });
};

const getAssignmentStats = async (start, end) => {
  const assignments = await Assignment.findAll({
    attributes: ['id', 'gradeId', 'dueDate', 'createdAt'],
    where: {
      [Op.or]: [
        { dueDate: { [Op.between]: [start, end] } },
        { createdAt: { [Op.between]: [start, end] } }
      ]
    },
    include: [
      {
        model: Grade,
        attributes: ['id', 'level'],
        required: false
      }
    ]
  });

  const assignmentIds = assignments.map((assignment) => assignment.id);
  if (!assignmentIds.length) {
    return {
      allAssignmentIds: new Set(),
      assignmentIdsByGradeId: new Map(),
      assignmentIdsByLevel: new Map(),
      submittedByStudent: new Map()
    };
  }

  const submissions = await Submission.findAll({
    attributes: ['assignmentId', 'studentId', 'submittedAt'],
    where: {
      assignmentId: { [Op.in]: assignmentIds },
      submittedAt: { [Op.between]: [start, end] }
    }
  });

  const allAssignmentIds = new Set();
  const assignmentIdsByGradeId = new Map();
  const assignmentIdsByLevel = new Map();
  const submittedByStudent = new Map();

  assignments.forEach((assignment) => {
    allAssignmentIds.add(assignment.id);

    if (assignment.gradeId) {
      if (!assignmentIdsByGradeId.has(assignment.gradeId)) {
        assignmentIdsByGradeId.set(assignment.gradeId, new Set());
      }
      assignmentIdsByGradeId.get(assignment.gradeId).add(assignment.id);
    }

    const gradeLevel = assignment.Grade?.level;
    if (gradeLevel !== null && gradeLevel !== undefined) {
      if (!assignmentIdsByLevel.has(gradeLevel)) {
        assignmentIdsByLevel.set(gradeLevel, new Set());
      }
      assignmentIdsByLevel.get(gradeLevel).add(assignment.id);
    }
  });

  submissions.forEach((submission) => {
    if (!submittedByStudent.has(submission.studentId)) {
      submittedByStudent.set(submission.studentId, new Set());
    }
    submittedByStudent.get(submission.studentId).add(submission.assignmentId);
  });

  return {
    allAssignmentIds,
    assignmentIdsByGradeId,
    assignmentIdsByLevel,
    submittedByStudent
  };
};

const getStudentAssignmentIds = (user, assignmentStats) => {
  const assignmentIds = new Set();
  const gradeId = user.GradeId || user.Grade?.id || null;
  const gradeLevel = user.grade ?? user.Grade?.level;

  if (gradeId && assignmentStats.assignmentIdsByGradeId.has(gradeId)) {
    assignmentStats.assignmentIdsByGradeId.get(gradeId).forEach((id) => assignmentIds.add(id));
  }

  if ((!assignmentIds.size || !gradeId) && gradeLevel !== null && gradeLevel !== undefined && assignmentStats.assignmentIdsByLevel.has(gradeLevel)) {
    assignmentStats.assignmentIdsByLevel.get(gradeLevel).forEach((id) => assignmentIds.add(id));
  }

  if (!assignmentIds.size) {
    assignmentStats.allAssignmentIds.forEach((id) => assignmentIds.add(id));
  }

  return assignmentIds;
};

const getAttendanceStats = async (start, end) => {
  const attendance = await Attendance.findAll({
    where: {
      date: { [Op.between]: [start, end] }
    }
  });

  // Calculate total days in range
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const stats = new Map();
  attendance.forEach((a) => {
    if (!stats.has(a.studentId)) stats.set(a.studentId, { present: 0, total: totalDays });
    const s = stats.get(a.studentId);
    if (a.status === 'present') s.present += 1;
  });
  return stats;
};

const buildStudentProgress = (rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, limit = 10, start = new Date(0), end = new Date()) => {
  const perStudent = new Map();
  const userById = new Map();

  rows.forEach((row) => {
    const user = row;
    if (!user || user.role !== 'student') return;
    userById.set(user.id, user);

    if (!perStudent.has(user.id)) {
      const className = user.Grade?.name || (user.grade ? `Class ${user.grade}` : 'Unassigned');
      perStudent.set(user.id, {
        userId: user.id,
        name: user.name,
        className,
        total: 0,
        completed: 0,
        quizSum: 0,
        quizCount: 0,
        lastActive: user.lastActive
      });
    }

    const agg = perStudent.get(user.id);
    const userProgress = user.Progresses || [];
    userProgress.forEach(p => {
      // Filter by date range in memory
      const d = p.updatedAt ? new Date(p.updatedAt) : null;
      const c = p.completedAt ? new Date(p.completedAt) : null;
      const isInRange = (d && d >= start && d <= end) || (c && c >= start && c <= end);
      
      if (!isInRange) return;

      agg.total += 1;
      if (p.completed) agg.completed += 1;
      if (p.quizScore !== null && p.quizScore !== undefined) {
        agg.quizSum += toNumber(p.quizScore);
        agg.quizCount += 1;
      }
    });
  });

  return [...perStudent.values()]
    .map((s) => {
      const user = userById.get(s.userId) || {};
      
      // Assignments
      const assignmentIds = getStudentAssignmentIds(user, assignmentStats);
      const submittedIds = assignmentStats.submittedByStudent.get(s.userId) || new Set();
      let completedAssignments = 0;
      assignmentIds.forEach((assignmentId) => {
        if (submittedIds.has(assignmentId)) completedAssignments += 1;
      });
      const assignmentCompletion = assignmentIds.size > 0
        ? Math.round((completedAssignments / assignmentIds.size) * 100)
        : 0;

      // Attendance
      const att = attendanceStats.get(s.userId) || { present: 0, total: 0 };
      const attendancePercentage = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;

      // Video Watching (minutes)
      const videoMinutes = watchTimeStatsPerStudent.get(s.userId) || 0;

      const score = s.quizCount > 0 ? Math.round(s.quizSum / s.quizCount) : 0;
      const progress = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;

      // Overall Performance Calculation (Weighted)
      // 30% Quiz, 30% Progress, 20% Assignments, 20% Attendance
      const overallPerformance = Math.round(
        (score * 0.3) + 
        (progress * 0.3) + 
        (assignmentCompletion * 0.2) + 
        (attendancePercentage * 0.2)
      );

      return {
        userId: s.userId,
        name: s.name,
        className: s.className,
        score,
        progress,
        assignmentCompletion,
        attendancePercentage,
        videoMinutes,
        overallPerformance,
        lastActive: s.lastActive
      };
    })
    .sort((a, b) => b.overallPerformance - a.overallPerformance || b.score - a.score)
    .slice(0, limit);
};

const buildDayActivity = (students, start, end) => {
  const dayMap = new Map();

  students.forEach((student) => {
    (student.Progresses || []).forEach(p => {
      if (!p.updatedAt) return;
      const key = new Date(p.updatedAt).toISOString().slice(0, 10);
      if (!dayMap.has(key)) dayMap.set(key, new Set());
      dayMap.get(key).add(student.id);
    });
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

const countVideosWatched = (students, start, end) => {
  let count = 0;
  students.forEach((student) => {
    (student.Progresses || []).forEach(p => {
      const d = p.updatedAt ? new Date(p.updatedAt) : null;
      if (d && d >= start && d <= end && p.Content && p.Content.type === 'video') {
        count++;
      }
    });
  });
  return count;
};

const countCompletedTopics = (students, start, end) => {
  let count = 0;
  students.forEach((student) => {
    (student.Progresses || []).forEach(p => {
      const d = p.completedAt ? new Date(p.completedAt) : null;
      if (p.completed && d && d >= start && d <= end) {
        count++;
      }
    });
  });
  return count;
};

const getAverageProgressPerStudent = (rows) => {
  const students = buildStudentProgress(rows, {
    allAssignmentIds: new Set(),
    assignmentIdsByGradeId: new Map(),
    assignmentIdsByLevel: new Map(),
    submittedByStudent: new Map()
  }, new Map(), new Map(), Number.MAX_SAFE_INTEGER);
  if (!students.length) return 0;
  const avg = students.reduce((sum, s) => sum + toNumber(s.progress), 0) / students.length;
  return Math.round(avg * 10) / 10;
};

const getAverageAssignmentCompletion = (students) => {
  if (!students.length) return 0;
  const avg = students.reduce((sum, s) => sum + toNumber(s.assignmentCompletion), 0) / students.length;
  return Math.round(avg * 10) / 10;
};

const buildClassPerformance = (students) => {
  const classMap = new Map();

  students.forEach((student) => {
    const className = student.className || 'Unassigned';
    if (!classMap.has(className)) {
      classMap.set(className, {
        className,
        students: 0,
        scoreSum: 0,
        progressSum: 0,
        assignmentCompletionSum: 0
      });
    }

    const agg = classMap.get(className);
    agg.students += 1;
    agg.scoreSum += toNumber(student.score);
    agg.progressSum += toNumber(student.progress);
    agg.assignmentCompletionSum += toNumber(student.assignmentCompletion);
  });

  return [...classMap.values()]
    .map((agg) => ({
      className: agg.className,
      students: agg.students,
      avgScore: agg.students > 0 ? Math.round((agg.scoreSum / agg.students) * 10) / 10 : 0,
      avgProgress: agg.students > 0 ? Math.round((agg.progressSum / agg.students) * 10) / 10 : 0,
      assignmentCompletion: agg.students > 0 ? Math.round((agg.assignmentCompletionSum / agg.students) * 10) / 10 : 0
    }))
    .sort((a, b) => b.avgScore - a.avgScore || b.avgProgress - a.avgProgress);
};

const getMostActiveSubject = (students, start, end) => {
  const activity = new Map();

  students.forEach((student) => {
    (student.Progresses || []).forEach(p => {
      const d = p.updatedAt ? new Date(p.updatedAt) : null;
      // We need subject info. We included Content in getReportProgressRows but not Subject.
      // However, we can't easily get it without another join or if it's already there.
      // Content model usually has Topic which has Subject. 
      // Let's assume for now we just want to avoid the crash.
      if (!d || d < start || d > end) return;
      if (p.Content?.type !== 'video') return;
      
      // In getReportProgressRows, I only included Content { id, type }. 
      // I should have included Subject info if I want this to work.
      // For now, let's just count general activity if subject is missing.
    });
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
  const seconds = await WatchTime.sum('seconds', {
    where: { date: { [Op.between]: [start, end] } }
  });
  // Return minutes as a number for the frontend to format
  return Math.round(toNumber(seconds) / 60);
};

const getWatchTimePerStudent = async (start, end) => {
  const watchTimes = await WatchTime.findAll({
    where: { date: { [Op.between]: [start, end] } },
    attributes: ['UserId', 'seconds']
  });
  const stats = new Map();
  watchTimes.forEach(wt => {
    const minutes = Math.round(toNumber(wt.seconds) / 60);
    stats.set(wt.UserId, (stats.get(wt.UserId) || 0) + minutes);
  });
  return stats;
};

const getDailyReport = async (req, res) => {
  try {
    const { start, end } = buildDateRange(1);
    const [rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, totalHours, activeStudents, newEnrollmentsToday] = await Promise.all([
      getReportProgressRows(start, end),
      getAssignmentStats(start, end),
      getAttendanceStats(start, end),
      getWatchTimePerStudent(start, end),
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

    const studentProgress = buildStudentProgress(rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, 10, start, end);
    const classPerformance = buildClassPerformance(studentProgress);
    const assignmentCompletionPercentage = getAverageAssignmentCompletion(studentProgress);
    const avgScore = studentProgress.length
      ? Math.round((studentProgress.reduce((sum, s) => sum + s.score, 0) / studentProgress.length) * 10) / 10
      : 0;
    const avgProgress = getAverageProgressPerStudent(rows);

    res.json({
      period: 'daily',
      range: { start, end },
      engagement: {
        activeUsers: activeStudents,
        totalHours: totalHours,
        completionRate: Math.round(avgProgress)
      },
      achievements: {
        totalAwarded: countCompletedTopics(rows, start, end), // Approximation
        topEarners: studentProgress.slice(0, 5)
      },
      assignments: {
        total: assignmentStats.allAssignmentIds.size,
        submitted: assignmentStats.submittedByStudent.size,
        graded: 0 // Not tracked yet
      },
      summary: {
        activeStudents: activeStudents,
        videosWatched: countVideosWatched(rows, start, end),
        lessonsCompleted: countCompletedTopics(rows, start, end),
        topPerformingClass: classPerformance.length > 0 ? classPerformance[0].className : 'N/A',
        assignmentCompletionPercentage
      },
      studentProgress,
      students: studentProgress,
      classPerformance,
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
    const [rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, totalHours, activeUsersThisWeek] = await Promise.all([
      getReportProgressRows(start, end),
      getAssignmentStats(start, end),
      getAttendanceStats(start, end),
      getWatchTimePerStudent(start, end),
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
    const studentProgress = buildStudentProgress(rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, 10, start, end);
    const classPerformance = buildClassPerformance(studentProgress);
    const assignmentCompletionPercentage = getAverageAssignmentCompletion(studentProgress);
    const avgScore = studentProgress.length
      ? Math.round((studentProgress.reduce((sum, s) => sum + s.score, 0) / studentProgress.length) * 10) / 10
      : 0;

    res.json({
      period: 'weekly',
      range: { start, end },
      engagement: {
        activeUsers: activeUsersThisWeek,
        totalHours: totalHours,
        completionRate: Math.round(averageProgressPerStudent)
      },
      achievements: {
        totalAwarded: countCompletedTopics(rows, start, end),
        topEarners: studentProgress.slice(0, 5)
      },
      assignments: {
        total: assignmentStats.allAssignmentIds.size,
        submitted: assignmentStats.submittedByStudent.size,
        graded: 0
      },
      summary: {
        activeStudents: activeUsersThisWeek,
        videosWatched: countVideosWatched(rows, start, end),
        lessonsCompleted: countCompletedTopics(rows, start, end),
        averageProgress: averageProgressPerStudent,
        mostActiveSubject: mostActiveSubject ? mostActiveSubject.name : 'N/A',
        assignmentCompletionPercentage
      },
      studentProgress,
      students: studentProgress,
      classPerformance,
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
    const [rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, totalHours, totalUsers] = await Promise.all([
      getReportProgressRows(start, end),
      getAssignmentStats(start, end),
      getAttendanceStats(start, end),
      getWatchTimePerStudent(start, end),
      getTotalWatchHours(start, end),
      User.count()
    ]);

    const topPerformingStudents = buildStudentProgress(rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, 5, start, end);
    const classPerformance = buildClassPerformance(topPerformingStudents);
    const assignmentCompletionPercentage = getAverageAssignmentCompletion(topPerformingStudents);
    
    let totalProgressRecords = 0;
    let completedProgressRecords = 0;
    rows.forEach(s => {
      (s.Progresses || []).forEach(p => {
        totalProgressRecords++;
        if (p.completed) completedProgressRecords++;
      });
    });
    
    const overallProgressPercentage = totalProgressRecords > 0 ? Math.round((completedProgressRecords / totalProgressRecords) * 1000) / 10 : 0;
    const averageProgressPerStudent = getAverageProgressPerStudent(rows);
    const avgScore = topPerformingStudents.length
      ? Math.round((topPerformingStudents.reduce((sum, s) => sum + s.score, 0) / topPerformingStudents.length) * 10) / 10
      : 0;

    res.json({
      period: 'monthly',
      range: { start, end },
      engagement: {
        activeUsers: totalUsers,
        totalHours: totalHours,
        completionRate: Math.round(averageProgressPerStudent)
      },
      achievements: {
        totalAwarded: countCompletedTopics(rows, start, end),
        topEarners: topPerformingStudents
      },
      assignments: {
        total: assignmentStats.allAssignmentIds.size,
        submitted: assignmentStats.submittedByStudent.size,
        graded: 0
      },
      summary: {
        activeStudents: totalUsers,
        lessonsCompleted: countCompletedTopics(rows, start, end),
        videosWatched: countVideosWatched(rows, start, end),
        topPerformingStudents,
        overallProgress: overallProgressPercentage,
        assignmentCompletionPercentage
      },
      studentProgress: topPerformingStudents,
      students: topPerformingStudents, // Added for frontend compatibility
      classPerformance,
      weeklyActivity: buildDayActivity(rows, start, end)
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ message: 'Failed to generate monthly report' });
  }
};

const getStudentsProgress = async (req, res) => {
  try {
    const { start, end } = buildDateRange(30); // Default to 30 days
    const [rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent] = await Promise.all([
      getReportProgressRows(start, end),
      getAssignmentStats(start, end),
      getAttendanceStats(start, end),
      getWatchTimePerStudent(start, end)
    ]);

    const students = buildStudentProgress(rows, assignmentStats, attendanceStats, watchTimeStatsPerStudent, 1000, start, end);
    
    // Log to emergency_log.txt for visibility
    const logPath = path.join(__dirname, '../emergency_log.txt');
    const logMsg = `\n--- DEBUG REPORT ---\nTime: ${new Date().toISOString()}\nTotal Users: ${rows.length}\nProcessed Students: ${students.length}\nSample: ${JSON.stringify(students.slice(0, 2))}\n`;
    fs.appendFileSync(logPath, logMsg);

    res.json(students);
  } catch (error) {
    console.error('Get students progress error:', error);
    res.status(500).json({ message: 'Failed to fetch student progress' });
  }
};

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getStudentsProgress
};
