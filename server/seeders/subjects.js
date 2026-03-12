const { Subject, Grade } = require('../models');

const subjectData = [
  { name: 'Mathematics', description: 'Learn numbers and calculations', icon: '🔢', color: '#FF6B6B', order: 1 },
  { name: 'English', description: 'Learn reading and writing', icon: '📖', color: '#4ECDC4', order: 2 },
  { name: 'Science', description: 'Explore the world around us', icon: '🔬', color: '#45B7D1', order: 3 },
  { name: 'Hindi', description: 'Learn Hindi language', icon: '🇮🇳', color: '#96CEB4', order: 4 },
  { name: 'Environmental Studies', description: 'Learn about our environment', icon: '🌍', color: '#FFEAA7', order: 5 }
];

const seedSubjects = async () => {
  try {
    const grades = await Grade.findAll();
    
    for (const grade of grades) {
      for (const subject of subjectData) {
        await Subject.create({
          ...subject,
          GradeId: grade.id
        });
      }
    }
    
    console.log('✅ Subjects seeded');
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
  }
};

module.exports = seedSubjects;