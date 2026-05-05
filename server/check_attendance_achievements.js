const { User, Achievement, Progress, Attendance, Notification } = require('./models');
const { Op } = require('sequelize');
const sequelize = require('./config/database');

async function checkAll() {
  try {
    await sequelize.authenticate();
    const students = await User.findAll({ where: { role: 'student' }, include: [Achievement] });

    const allAchievements = await Achievement.findAll();

    for (const user of students) {
      const userAchievementIds = user.Achievements.map(a => a.id);
      
      for (const achievement of allAchievements) {
        if (!userAchievementIds.includes(achievement.id)) {
          let earned = false;
          const criteria = achievement.criteria;
          if (!criteria) continue;

          switch (criteria.type) {
            case 'attendance':
              const count = await Attendance.count({ where: { studentId: user.id, status: 'present' } });
              earned = count >= criteria.value;
              break;
            // Add other cases if needed, but we focus on attendance here
          }

          if (earned) {
            await user.addAchievement(achievement);
            user.points += achievement.points;
            console.log(`Awarded "${achievement.name}" to ${user.email}`);
          }
        }
      }
      await user.save();
    }
    console.log('Finished checking all students.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkAll();
