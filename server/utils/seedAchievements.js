const { Achievement, User, Grade, Submission, Assignment } = require('../models');
const sequelize = require('../config/database');

const seedAchievements = async () => {
  try {
    // 1. Create Grades if they don't exist
    const grades = await Grade.findAll();
    if (grades.length === 0) {
      await Grade.bulkCreate([
        { name: 'Class 1', level: 1 },
        { name: 'Class 2', level: 2 },
        { name: 'Class 3', level: 3 },
        { name: 'Class 4', level: 4 },
        { name: 'Class 5', level: 5 },
      ]);
    }
    const allGrades = await Grade.findAll();

    // 2. Create Achievements if they don't exist
    const achievementsCount = await Achievement.count();
    if (achievementsCount === 0) {
      await Achievement.bulkCreate([
        { name: 'First Step', icon: '🏃', points: 10, category: 'general', rarity: 'common', criteria: { type: 'attendance', value: 1 } },
        { name: 'Star Pupil', icon: '⭐', points: 50, category: 'academic', rarity: 'rare', criteria: { type: 'quiz_score', value: 90, count: 5 } },
        { name: 'Video Master', icon: '📺', points: 30, category: 'learning', rarity: 'uncommon', criteria: { type: 'watch_time', value: 60 } },
        { name: 'Note Taker', icon: '📝', points: 20, category: 'learning', rarity: 'common', criteria: { type: 'content_completed', value: 10 } },
      ]);
    }
    const allAchievements = await Achievement.findAll();

    // 3. Create Students if they don't exist
    const students = await User.findAll({ where: { role: 'student' } });
    if (students.length === 0) {
      for (let i = 1; i <= 10; i++) {
        const grade = allGrades[Math.floor(Math.random() * allGrades.length)];
        await User.create({
          name: `Student ${i}`,
          firstName: 'Student',
          middleName: '',
          lastName: `${i}`,
          email: `student${i}@example.com`,
          password: 'password123',
          role: 'student',
          GradeId: grade.id,
          grade: grade.level,
          points: Math.floor(Math.random() * 500),
          streak: Math.floor(Math.random() * 10)
        });
      }
    }
    const allStudents = await User.findAll({ where: { role: 'student' } });

    // 4. Award some achievements
    for (const student of allStudents) {
      const currentAchievements = await student.getAchievements();
      if (currentAchievements.length === 0) {
        // Award 1-2 random achievements
        const count = Math.floor(Math.random() * 2) + 1;
        const shuffled = allAchievements.sort(() => 0.5 - Math.random());
        for (let i = 0; i < count; i++) {
          await student.addAchievement(shuffled[i]);
        }
      }
    }

    console.log('✅ Achievement seed data added successfully');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
  }
};

module.exports = seedAchievements;
