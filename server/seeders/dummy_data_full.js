const sequelize = require('../config/database');
const { 
  Grade, Subject, Topic, Lesson, Content, 
  Assignment, Quiz, User, Achievement 
} = require('../models');
require('dotenv').config();

const dummyContentSeeder = async () => {
  try {
    console.log('🌱 Starting dummy CONTENT seeding (skipping users)...');

    // 1. Sync database (WITHOUT force: true to preserve users)
    await sequelize.sync();
    console.log('🔄 Database synced');

    // 2. Find a teacher or admin to associate content with
    const staff = await User.findOne({ where: { role: ['teacher', 'admin'] } });
    if (!staff) {
      console.error('❌ No teacher or admin found in database. Please create one first.');
      process.exit(1);
    }
    console.log(`👤 Using user ${staff.email} as content creator`);

    // 3. Create/Update Classes (1 to 6)
    const classData = [
      { level: 1, name: 'Class 1', icon: '🌈', color: '#FF6B6B' },
      { level: 2, name: 'Class 2', icon: '🌟', color: '#4ECDC4' },
      { level: 3, name: 'Class 3', icon: '🎨', color: '#45B7D1' },
      { level: 4, name: 'Class 4', icon: '📚', color: '#96CEB4' },
      { level: 5, name: 'Class 5', icon: '🚀', color: '#B0125B' },
      { level: 6, name: 'Class 6', icon: '🌙', color: '#0B1F3B' }
    ];

    const grades = [];
    for (const data of classData) {
      const [grade] = await Grade.findOrCreate({
        where: { level: data.level },
        defaults: {
          ...data,
          description: `${data.name} educational materials`,
          order: data.level
        }
      });
      grades.push(grade);
    }
    console.log('🏫 Classes 1-6 verified/created');

    // 4. Create Curriculum for each Class
    for (const grade of grades) {
      const [subject] = await Subject.findOrCreate({
        where: { name: 'Mathematics', GradeId: grade.id },
        defaults: {
          description: 'Core Math Concepts', 
          icon: '🔢', color: grade.color, order: 1 
        }
      });

      const [topic] = await Topic.findOrCreate({
        where: { name: `Basics of ${grade.name} Math`, SubjectId: subject.id },
        defaults: {
          description: 'Foundational concepts', 
          order: 1 
        }
      });

      const [lesson] = await Lesson.findOrCreate({
        where: { title: `Introduction to ${grade.name}`, GradeId: grade.id, SubjectId: subject.id },
        defaults: {
          description: `Welcome to ${grade.name} learning journey`, 
          TopicId: topic.id, 
          createdBy: staff.id 
        }
      });

      // Add one video if not exists
      await Content.findOrCreate({
        where: { title: `${grade.name} Intro Video`, LessonId: lesson.id },
        defaults: {
          type: 'video',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: 10, isPublished: true,
          SubjectId: subject.id, GradeId: grade.id,
          createdBy: staff.id
        }
      });

      // Add homework if not exists
      await Assignment.findOrCreate({
        where: { title: `${grade.name} Homework #1`, LessonId: lesson.id },
        defaults: {
          description: 'Complete the introductory exercises.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      });

      // Add quiz if not exists
      await Quiz.findOrCreate({
        where: { title: `${grade.name} Quick Quiz`, LessonId: lesson.id },
        defaults: {
          questions: [
            { question: 'Is learning fun?', options: ['Yes', 'Definitely', 'Always', 'Sure'], correctAnswer: 'Yes' }
          ],
          isPublished: true,
          createdBy: staff.id
        }
      });
    }
    console.log('📝 Curriculum data populated');

    // 5. Achievements
    await Achievement.findOrCreate({
      where: { name: 'First Steps' },
      defaults: { description: 'Started your journey', icon: '🏆', points: 50, category: 'watch', rarity: 'common' }
    });

    console.log('\n✨ DUMMY CONTENT SEEDED (USERS PRESERVED) ✨');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

dummyContentSeeder();
