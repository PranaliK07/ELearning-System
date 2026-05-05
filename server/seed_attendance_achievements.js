const { Achievement } = require('./models');
const sequelize = require('./config/database');

async function seed() {
  try {
    await sequelize.authenticate();
    
    const attendanceAchievements = [
      {
        name: 'First Day Fun!',
        description: 'Attended your first day of school!',
        icon: '🌅',
        criteria: { type: 'attendance', value: 1 },
        points: 50,
        category: 'Attendance',
        rarity: 'common'
      },
      {
        name: 'Regular Learner',
        description: 'Attended school for 5 days!',
        icon: '📅',
        criteria: { type: 'attendance', value: 5 },
        points: 150,
        category: 'Attendance',
        rarity: 'uncommon'
      },
      {
        name: 'Perfect Week',
        description: '7 days of perfect attendance!',
        icon: '🌟',
        criteria: { type: 'attendance', value: 7 },
        points: 300,
        category: 'Attendance',
        rarity: 'rare'
      },
      {
        name: 'Attendance Hero',
        description: '30 days of consistent learning!',
        icon: '🏆',
        criteria: { type: 'attendance', value: 30 },
        points: 1000,
        category: 'Attendance',
        rarity: 'epic'
      }
    ];

    for (const a of attendanceAchievements) {
      await Achievement.findOrCreate({
        where: { name: a.name },
        defaults: a
      });
      console.log(`Ensured achievement: ${a.name}`);
    }

    console.log('Attendance achievements seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    process.exit();
  }
}

seed();
