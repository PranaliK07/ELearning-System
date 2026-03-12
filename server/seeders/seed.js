const sequelize = require('../config/database');
const { Grade, Subject, Topic, Achievement, User } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('🔄 Database synced');

    // Seed Grades
    const grades = await Grade.bulkCreate([
      { level: 1, name: 'Class 1', description: 'Beginner Level - Foundation', icon: '🌈', color: '#FF6B6B', order: 1 },
      { level: 2, name: 'Class 2', description: 'Building Basic Concepts', icon: '🌟', color: '#4ECDC4', order: 2 },
      { level: 3, name: 'Class 3', description: 'Intermediate Learning', icon: '🎨', color: '#45B7D1', order: 3 },
      { level: 4, name: 'Class 4', description: 'Advanced Concepts', icon: '📚', color: '#96CEB4', order: 4 },
      { level: 5, name: 'Class 5', description: 'Mastery Level', icon: '🚀', color: '#FFEAA7', order: 5 }
    ]);

    // Seed Subjects for each grade
    for (const grade of grades) {
      await Subject.bulkCreate([
        { name: 'Mathematics', description: 'Learn numbers and calculations', icon: '🔢', color: '#FF6B6B', GradeId: grade.id, order: 1 },
        { name: 'English', description: 'Learn reading and writing', icon: '📖', color: '#4ECDC4', GradeId: grade.id, order: 2 },
        { name: 'Science', description: 'Explore the world around us', icon: '🔬', color: '#45B7D1', GradeId: grade.id, order: 3 },
        { name: 'Hindi', description: 'Learn Hindi language', icon: '🇮🇳', color: '#96CEB4', GradeId: grade.id, order: 4 },
        { name: 'Environmental Studies', description: 'Learn about our environment', icon: '🌍', color: '#FFEAA7', GradeId: grade.id, order: 5 }
      ]);
    }

    // Seed Achievements
    await Achievement.bulkCreate([
      {
        name: 'First Steps',
        description: 'Watch your first video',
        icon: '🌟',
        criteria: { type: 'watch_time', value: 10 },
        points: 10,
        category: 'watch',
        rarity: 'common'
      },
      {
        name: 'Quick Learner',
        description: 'Complete 5 lessons',
        icon: '📚',
        criteria: { type: 'content_completed', value: 5 },
        points: 20,
        category: 'watch',
        rarity: 'common'
      },
      {
        name: 'Quiz Master',
        description: 'Score 100% in any quiz',
        icon: '🏆',
        criteria: { type: 'quiz_score', value: 100 },
        points: 30,
        category: 'quiz',
        rarity: 'rare'
      },
      {
        name: 'Dedicated Student',
        description: 'Watch 100 minutes of content',
        icon: '⏰',
        criteria: { type: 'watch_time', value: 100 },
        points: 50,
        category: 'watch',
        rarity: 'rare'
      },
      {
        name: '7-Day Streak',
        description: 'Log in for 7 consecutive days',
        icon: '🔥',
        criteria: { type: 'streak', value: 7 },
        points: 70,
        category: 'streak',
        rarity: 'epic'
      }
    ]);

    // Create admin user
    const adminExists = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });

    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log('👑 Admin user created');
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;