const path = require('path');
const workspace = 'e:\\ELearning-System';
require('dotenv').config({ path: path.join(workspace, 'server', '.env') });
const { User, Progress, WatchTime, Assignment, Submission, Content, Grade } = require(path.join(workspace, 'server', 'models'));
const sequelize = require(path.join(workspace, 'server', 'config', 'database'));
const bcrypt = require('bcryptjs');

async function seedWeeklyProgress() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Ensure a Grade exists
    let [grade] = await Grade.findOrCreate({
      where: { level: 10 },
      defaults: { name: 'Grade 10', level: 10 }
    });

    // 2. Create Dummy Students
    const studentData = [
      { name: 'Arjun Sharma', email: 'arjun@example.com' },
      { name: 'Sanya Malhotra', email: 'sanya@example.com' },
      { name: 'Rohan Gupta', email: 'rohan@example.com' },
      { name: 'Ishani Roy', email: 'ishani@example.com' }
    ];

    const hashedPassword = await bcrypt.hash('Student@123', 10);
    const students = [];

    for (const data of studentData) {
      const [student] = await User.findOrCreate({
        where: { email: data.email },
        defaults: {
          name: data.name,
          firstName: data.name.split(' ')[0],
          middleName: '',
          lastName: data.name.split(' ')[1],
          password: hashedPassword,
          role: 'student',
          grade: 10,
          GradeId: grade.id,
          isActive: true,
          isDeleted: false
        }
      });
      students.push(student);
    }

    // 3. Get some content to link progress to
    const contents = await Content.findAll({ limit: 5 });
    if (contents.length === 0) {
      console.log('No content found to link progress. Please seed content first.');
    }

    // 4. Generate Weekly Progress & WatchTime
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      for (const student of students) {
        // WatchTime (15-60 mins daily)
        await WatchTime.create({
          UserId: student.id,
          seconds: Math.floor(Math.random() * 2700) + 900,
          date: date
        });

        // Progress
        if (contents.length > 0) {
          const content = contents[Math.floor(Math.random() * contents.length)];
          await Progress.create({
            UserId: student.id,
            ContentId: content.id,
            completed: Math.random() > 0.3,
            quizScore: Math.floor(Math.random() * 40) + 60,
            updatedAt: date,
            createdAt: date,
            completedAt: Math.random() > 0.3 ? date : null
          });
        }
      }
    }

    console.log('✅ Weekly progress dummy data seeded successfully!');
    console.log(`Seeded ${students.length} students with 7 days of activity each.`);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    process.exit();
  }
}

seedWeeklyProgress();
