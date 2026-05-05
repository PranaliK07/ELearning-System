const { Achievement, User, Progress, WatchTime, Submission, Comment, Like, Attendance, Content, Quiz, Assignment } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notifications');
const moment = require('moment');

// Use a consistent date format that works across timezones
const getTodayStr = () => {
  return moment().format('YYYY-MM-DD');
};

const getDailyGoalProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = getTodayStr();
    // Also check for "yesterday" just in case of timezone lag (late night study sessions)
    const yesterdayStr = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const startOfToday = moment().startOf('day').toDate();

    console.log(`[Achievement Check] User: ${userId} | Today: ${todayStr}`);

    // 1. Attendance Star
    // Check for present record today or yesterday (to handle timezone shifts)
    const attendanceRecord = await Attendance.findOne({
      where: {
        studentId: userId,
        date: { [Op.in]: [todayStr, yesterdayStr] },
        status: 'present'
      }
    });

    // 2. Watch Video Star
    const videoToday = await WatchTime.findOne({
      where: {
        UserId: userId,
        date: todayStr
      }
    });

    // 3. Quiz Star
    const quizToday = await Progress.findOne({
      where: {
        UserId: userId,
        QuizId: { [Op.ne]: null },
        lastQuizAttempt: { [Op.gte]: startOfToday }
      }
    });

    // 4. Homework Star
    const submittedToday = await Submission.findOne({
      where: {
        studentId: userId,
        submittedAt: { [Op.gte]: startOfToday }
      }
    });

    let homeworkCompleted = !!submittedToday;
    if (!homeworkCompleted) {
      const student = await User.findByPk(userId);
      if (student && student.GradeId) {
        const totalAssignments = await Assignment.count({ where: { gradeId: student.GradeId } });
        if (totalAssignments > 0) {
          const completedCount = await Submission.count({
            where: { studentId: userId },
            include: [{ model: Assignment, where: { gradeId: student.GradeId } }]
          });
          if (completedCount >= totalAssignments) homeworkCompleted = true;
        } else {
          homeworkCompleted = true;
        }
      }
    }

    // 5. Notes Star
    const notesToday = await Progress.findOne({
      where: {
        UserId: userId,
        notesDownloaded: true,
        updatedAt: { [Op.gte]: startOfToday }
      }
    });

    // Auto-award attendance star if user has ANY activity today
    const isActiveToday = !!videoToday || !!quizToday || !!submittedToday || !!notesToday;
    const attendanceDone = !!attendanceRecord || isActiveToday;

    const goals = [
      { id: 'attendance', label: 'Attendance', completed: !!attendanceDone, icon: '📅' },
      { id: 'video', label: 'Watch Video', completed: !!videoToday, icon: '📺' },
      { id: 'quiz', label: 'Solve Quiz', completed: !!quizToday, icon: '🧠' },
      { id: 'homework', label: 'Done Homework', completed: !!homeworkCompleted, icon: '📝' },
      { id: 'notes', label: 'Notes', completed: !!notesToday, icon: '📑' }
    ];

    const starsEarned = goals.filter(g => g.completed).length;

    res.json({
      success: true,
      goals,
      starsEarned,
      message: starsEarned === 5 ? "MAX STARS EARNED! 🌟" : "Keep going!"
    });
  } catch (error) {
    console.error('Daily goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentDailyGoalProgress = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const todayStr = getTodayStr();
    const yesterdayStr = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const startOfToday = moment().startOf('day').toDate();

    const student = await User.findByPk(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const sevenDaysAgoStr = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const sevenDaysAgoDate = moment().subtract(7, 'days').startOf('day').toDate();

    const attendances = await Attendance.findAll({ where: { studentId, date: { [Op.gte]: sevenDaysAgoStr }, status: 'present' } });
    const watchTimes = await WatchTime.findAll({ where: { UserId: studentId, date: { [Op.gte]: sevenDaysAgoStr } } });
    const quizzes = await Progress.findAll({ where: { UserId: studentId, QuizId: { [Op.ne]: null }, lastQuizAttempt: { [Op.gte]: sevenDaysAgoDate } } });
    const submissions = await Submission.findAll({ where: { studentId, submittedAt: { [Op.gte]: sevenDaysAgoDate } } });
    const notes = await Progress.findAll({ where: { UserId: studentId, notesDownloaded: true, updatedAt: { [Op.gte]: sevenDaysAgoDate } } });

    let homeworkCompletedTotal = false;
    if (student.GradeId) {
      const totalAssignments = await Assignment.count({ where: { gradeId: student.GradeId } });
      if (totalAssignments === 0) {
        homeworkCompletedTotal = true;
      } else {
        const completedCount = await Submission.count({
          where: { studentId },
          include: [{ model: Assignment, where: { gradeId: student.GradeId } }]
        });
        if (completedCount >= totalAssignments) homeworkCompletedTotal = true;
      }
    } else {
      homeworkCompletedTotal = true;
    }

    const history = [];
    let todayGoals = [];

    // Loop through today (0) and past 6 days (1-6)
    for (let i = 0; i < 7; i++) {
      const targetDate = moment().subtract(i, 'days');
      const dateStr = targetDate.format('YYYY-MM-DD');
      
      const hasAttendance = attendances.some(a => a.date === dateStr);
      const hasVideo = watchTimes.some(w => w.date === dateStr);
      const hasQuiz = quizzes.some(q => moment(q.lastQuizAttempt).format('YYYY-MM-DD') === dateStr);
      const hasSubmission = submissions.some(s => moment(s.submittedAt).format('YYYY-MM-DD') === dateStr);
      const hasNotes = notes.some(n => moment(n.updatedAt).format('YYYY-MM-DD') === dateStr);

      const isActive = hasVideo || hasQuiz || hasSubmission || hasNotes;
      const attendanceDone = hasAttendance || isActive;
      const homeworkDone = hasSubmission || homeworkCompletedTotal;

      const dailyGoals = [
        { id: 'attendance', label: 'Attendance', completed: !!attendanceDone, icon: '📅' },
        { id: 'video', label: 'Watch Video', completed: !!hasVideo, icon: '📺' },
        { id: 'quiz', label: 'Solve Quiz', completed: !!hasQuiz, icon: '🧠' },
        { id: 'homework', label: 'Done Homework', completed: !!homeworkDone, icon: '📝' },
        { id: 'notes', label: 'Notes', completed: !!hasNotes, icon: '📒' }
      ];

      if (i === 0) {
        todayGoals = dailyGoals;
      } else {
        history.push({
          date: dateStr,
          goals: dailyGoals,
          starsEarned: dailyGoals.filter(g => g.completed).length
        });
      }
    }

    res.json({ 
      success: true, 
      goals: todayGoals, 
      starsEarned: todayGoals.filter(g => g.completed).length,
      history 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll({ order: [['points', 'DESC']] });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Achievement, through: { attributes: ['earnedAt'] } }]
    });
    res.json(user.Achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const checkAndAwardAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { include: [Progress, Achievement] });
    const achievements = await Achievement.findAll();
    const userAchievementIds = user.Achievements.map(a => a.id);
    const awarded = [];

    for (const achievement of achievements) {
      if (!userAchievementIds.includes(achievement.id)) {
        let earned = false;
        switch (achievement.criteria.type) {
          case 'watch_time': earned = user.totalWatchTime >= achievement.criteria.value; break;
          case 'content_completed':
            const completedCount = await Progress.count({ where: { UserId: userId, completed: true } });
            earned = completedCount >= achievement.criteria.value;
            break;
          case 'quiz_score':
            const highScores = await Progress.count({ where: { UserId: userId, quizScore: { [Op.gte]: achievement.criteria.value } } });
            earned = highScores >= (achievement.criteria.count || 1);
            break;
          case 'streak': earned = user.streak >= achievement.criteria.value; break;
          case 'attendance':
            const presentCount = await Attendance.count({ where: { studentId: userId, status: 'present' } });
            earned = presentCount >= achievement.criteria.value;
            break;
        }
        if (earned) {
          await user.addAchievement(achievement);
          user.points += achievement.points;
          awarded.push(achievement);
          await createNotification(userId, 'achievement', 'Achievement Earned! 🏆', `Congratulations! You've earned the "${achievement.name}" achievement!`, { achievementId: achievement.id });
        }
      }
    }
    await user.save();
    res.json({ success: true, awarded, totalPoints: user.points });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAchievementLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({ attributes: ['id', 'name', 'avatar', 'points'], where: { isActive: true }, order: [['points', 'DESC']], limit: 20 });
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json({ success: true, message: 'Achievement created successfully', achievement });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    Object.assign(achievement, req.body);
    await achievement.save();
    res.json({ success: true, message: 'Achievement updated successfully', achievement });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    await achievement.destroy();
    res.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAchievements,
  getAchievement,
  getUserAchievements,
  checkAndAwardAchievements,
  getAchievementLeaderboard,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getDailyGoalProgress,
  getStudentDailyGoalProgress
};
