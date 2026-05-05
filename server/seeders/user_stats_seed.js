const sequelize = require('../config/database');
const { User, Attendance, WatchTime, Grade } = require('../models');
const moment = require('moment');

const seedUserStats = async () => {
  try {
    console.log('🌱 Seeding specific user stats...');

    // Find the first student
    const student = await User.findOne({ where: { role: 'student' } });
    if (!student) {
      console.error('❌ No student found. Please run the main seeder first.');
      process.exit(1);
    }

    console.log(`👤 Seeding stats for student: ${student.email}`);

    // 1. Attendance 100% (1 record, present)
    const today = moment().format('YYYY-MM-DD');
    await Attendance.findOrCreate({
      where: {
        studentId: student.id,
        date: today
      },
      defaults: {
        status: 'present',
        gradeId: student.GradeId || 1,
        markedById: 1 // Assume admin/teacher ID 1 exists
      }
    });
    console.log('✅ Attendance seeded (100%)');

    // 2. Watch time 33 mins (1980 seconds)
    // We'll distribute it over the last 7 days for the chart
    const totalSeconds = 33 * 60;
    const dailySeconds = Math.floor(totalSeconds / 7);

    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      await WatchTime.findOrCreate({
        where: {
          UserId: student.id,
          date: date,
          ContentId: 1 // Assume some content exists
        },
        defaults: {
          seconds: dailySeconds
        }
      });
    }
    
    // Update the cached totalWatchTime on user model
    student.totalWatchTime = totalSeconds;
    await student.save();
    
    console.log('✅ Watch time seeded (33 mins)');

    console.log('✨ Stats seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedUserStats();
