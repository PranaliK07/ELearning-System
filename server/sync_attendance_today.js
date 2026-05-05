const { User, Attendance, WatchTime, Progress, Submission } = require('./models');
const sequelize = require('./config/database');
const { Op } = require('sequelize');

async function syncToday() {
  try {
    await sequelize.authenticate();
    const today = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    console.log(`Syncing attendance for ${today}...`);

    const students = await User.findAll({ where: { role: 'student' } });

    for (const student of students) {
      // Check for activity today
      const video = await WatchTime.findOne({ where: { UserId: student.id, date: today } });
      const quiz = await Progress.findOne({ where: { UserId: student.id, lastQuizAttempt: { [Op.gte]: startOfToday } } });
      const homework = await Submission.findOne({ where: { studentId: student.id, submittedAt: { [Op.gte]: startOfToday } } });
      const notes = await Progress.findOne({ where: { UserId: student.id, notesDownloaded: true, updatedAt: { [Op.gte]: startOfToday } } });

      if (video || quiz || homework || notes) {
        const [record, created] = await Attendance.findOrCreate({
          where: { studentId: student.id, date: today },
          defaults: {
            status: 'present',
            gradeId: student.GradeId || 1,
            markedById: student.id,
            note: 'Sync-mark via learning activity'
          }
        });
        
        if (created) {
          console.log(`Marked ${student.email} as present for today.`);
        } else if (record.status !== 'present') {
          record.status = 'present';
          await record.save();
          console.log(`Updated ${student.email} to present for today.`);
        }
      }
    }

    console.log('Sync complete.');
  } catch (err) {
    console.error('Sync failed:', err);
  } finally {
    process.exit();
  }
}

syncToday();
