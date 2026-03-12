const { Grade } = require('../models');

const gradeData = [
  { level: 1, name: 'Class 1', description: 'Beginner Level - Foundation', icon: '🌈', color: '#FF6B6B', order: 1 },
  { level: 2, name: 'Class 2', description: 'Building Basic Concepts', icon: '🌟', color: '#4ECDC4', order: 2 },
  { level: 3, name: 'Class 3', description: 'Intermediate Learning', icon: '🎨', color: '#45B7D1', order: 3 },
  { level: 4, name: 'Class 4', description: 'Advanced Concepts', icon: '📚', color: '#96CEB4', order: 4 },
  { level: 5, name: 'Class 5', description: 'Mastery Level', icon: '🚀', color: '#FFEAA7', order: 5 }
];

const seedGrades = async () => {
  try {
    await Grade.bulkCreate(gradeData);
    console.log('✅ Grades seeded');
  } catch (error) {
    console.error('❌ Error seeding grades:', error);
  }
};

module.exports = seedGrades;