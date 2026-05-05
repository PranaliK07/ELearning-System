const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sequelize = require('../config/database');
const {
  Grade,
  Subject,
  Topic,
  Lesson,
  User,
  Content,
  Quiz,
  Progress,
  Announcement,
  Assignment
} = require('../models');

const ensureRecord = async (model, where, defaults) => {
  const [record] = await model.findOrCreate({ where, defaults });
  return record;
};

const seedDummyData = async () => {
  try {
    await sequelize.sync();

    const grade = await ensureRecord(Grade, { level: 1 }, {
      level: 1,
      name: 'Class 1',
      description: 'Starter grade for demo content',
      icon: 'book',
      color: '#4F46E5',
      order: 1
    });

    const subject = await ensureRecord(Subject, {
      name: 'Mathematics',
      GradeId: grade.id
    }, {
      name: 'Mathematics',
      description: 'Demo mathematics lessons',
      icon: 'calculate',
      color: '#0EA5E9',
      order: 1,
      GradeId: grade.id,
      isActive: true
    });

    const topic = await ensureRecord(Topic, {
      name: 'Fractions Intro',
      SubjectId: subject.id
    }, {
      name: 'Fractions Intro',
      description: 'Introductory fraction concepts',
      thumbnail: 'fractions-topic.png',
      order: 1,
      isActive: true,
      isDeleted: false,
      estimatedTime: 25,
      SubjectId: subject.id
    });

    const teacher = await ensureRecord(User, {
      email: 'demo.teacher@elearning.com'
    }, {
      name: 'Demo Teacher',
      firstName: 'Demo',
      middleName: '',
      lastName: 'Teacher',
      email: 'demo.teacher@elearning.com',
      password: 'Teacher@123',
      role: 'teacher',
      isActive: true,
      isDeleted: false,
      emailVerified: true
    });

    const student = await ensureRecord(User, {
      email: 'demo.student@elearning.com'
    }, {
      name: 'Demo Student',
      firstName: 'Demo',
      middleName: '',
      lastName: 'Student',
      email: 'demo.student@elearning.com',
      password: 'Student@123',
      role: 'student',
      grade: grade.level,
      GradeId: grade.id,
      isActive: true,
      isDeleted: false,
      emailVerified: true
    });

    const lesson = await ensureRecord(Lesson, {
      title: 'Fractions Warmup',
      TopicId: topic.id
    }, {
      title: 'Fractions Warmup',
      description: 'A short lesson to warm up on fractions.',
      category: 'daily',
      order: 1,
      isPublished: true,
      GradeId: grade.id,
      SubjectId: subject.id,
      TopicId: topic.id,
      createdBy: teacher.id
    });

    const videoContent = await ensureRecord(Content, {
      title: 'Fractions Basics Video',
      type: 'video'
    }, {
      title: 'Fractions Basics Video',
      type: 'video',
      description: 'Short demo video for fractions.',
      videoUrl: 'https://example.com/videos/fractions-basics.mp4',
      thumbnail: 'fractions-video.png',
      duration: 12,
      isPremium: false,
      isPublished: true,
      views: 128,
      likes: 34,
      order: 1,
      tags: ['fractions', 'math', 'demo'],
      metadata: { level: 'easy', language: 'en' },
      GradeId: grade.id,
      SubjectId: subject.id,
      TopicId: topic.id,
      LessonId: lesson.id,
      createdBy: teacher.id
    });

    await ensureRecord(Content, {
      title: 'Fractions Quick Notes',
      type: 'reading'
    }, {
      title: 'Fractions Quick Notes',
      type: 'reading',
      description: 'One-page notes for the demo lesson.',
      readingMaterial: '<h1>Fractions Quick Notes</h1><p>Fractions represent parts of a whole.</p>',
      duration: 5,
      isPremium: false,
      isPublished: true,
      views: 64,
      likes: 18,
      order: 2,
      tags: ['fractions', 'reading', 'demo'],
      metadata: { level: 'easy', format: 'notes' },
      GradeId: grade.id,
      SubjectId: subject.id,
      TopicId: topic.id,
      LessonId: lesson.id,
      createdBy: teacher.id
    });

    const quiz = await ensureRecord(Quiz, {
      title: 'Fractions Basics Quiz'
    }, {
      title: 'Fractions Basics Quiz',
      description: 'Quick quiz for the demo lesson.',
      questions: [
        {
          question: 'What is 1/2 of 8?',
          options: ['2', '4', '6', '8'],
          answer: '4'
        },
        {
          question: 'Which fraction is equal to one whole?',
          options: ['1/2', '2/3', '4/4', '3/5'],
          answer: '4/4'
        },
        {
          question: 'How many equal parts make 1/3?',
          options: ['1', '2', '3', '4'],
          answer: '3'
        }
      ],
      timeLimit: 10,
      passingScore: 70,
      maxAttempts: 2,
      attempts: 0,
      avgScore: 0,
      isPublished: true,
      isDeleted: false,
      createdBy: teacher.id,
      TopicId: topic.id,
      LessonId: lesson.id
    });

    await ensureRecord(Announcement, {
      title: 'Welcome to the Demo Class'
    }, {
      title: 'Welcome to the Demo Class',
      content: 'This is a sample announcement created for local development data.',
      priority: 'high',
      targetRole: 'students',
      targetGrades: [grade.level],
      pinned: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await ensureRecord(Assignment, {
      title: 'Fractions Practice Sheet'
    }, {
      title: 'Fractions Practice Sheet',
      description: 'Practice worksheet for the demo lesson.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'active',
      attachmentUrl: 'https://example.com/files/fractions-practice.pdf',
      LessonId: lesson.id
    });

    await ensureRecord(Progress, {
      UserId: student.id,
      ContentId: videoContent.id
    }, {
      UserId: student.id,
      ContentId: videoContent.id,
      watchTime: 420,
      lastWatched: new Date(),
      completed: true,
      completedAt: new Date(),
      quizScore: 90,
      quizAttempts: 1,
      quizPassed: true,
      lastQuizAttempt: new Date(),
      notes: 'Sample progress record for local demo data.',
      notesDownloaded: true,
      bookmarked: true
    });

    console.log('Dummy data seeded successfully');
  } catch (error) {
    console.error('Error seeding dummy data:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  seedDummyData().then(() => process.exit(process.exitCode || 0));
}

module.exports = seedDummyData;
