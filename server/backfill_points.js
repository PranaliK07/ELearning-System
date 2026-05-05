const { User, Progress } = require('./models');
const sequelize = require('./config/database');

async function backfill() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const students = await User.findAll({ where: { role: 'student' } });
    console.log(`Recalculating stars (points) for ${students.length} students...`);

    for (const student of students) {
      const completedCount = await Progress.count({
        where: { UserId: student.id, completed: true }
      });
      
      const quizPassedCount = await Progress.count({
        where: { UserId: student.id, quizPassed: true }
      });

      // Calculate total points based on progress
      // 10 for each completed content, 20 for each passed quiz
      const totalPoints = (completedCount * 10) + (quizPassedCount * 20);
      
      student.points = totalPoints;
      await student.save();
      console.log(`Synced ${student.email}: ${totalPoints} Stars (Points)`);
    }

    console.log('Backfill complete.');
  } catch (err) {
    console.error('Backfill failed:', err);
  } finally {
    process.exit();
  }
}

backfill();
