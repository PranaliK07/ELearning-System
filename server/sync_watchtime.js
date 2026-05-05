const { User, Progress } = require('./models');
const sequelize = require('./config/database');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const students = await User.findAll({ where: { role: 'student' } });
    console.log(`Syncing watch time for ${students.length} students...`);

    for (const student of students) {
      const totalSeconds = await Progress.sum('watchTime', {
        where: { UserId: student.id }
      }) || 0;
      
      student.totalWatchTime = totalSeconds;
      await student.save();
      console.log(`Synced ${student.email}: ${totalSeconds}s`);
    }

    console.log('Sync complete.');
  } catch (err) {
    console.error('Sync failed:', err);
  } finally {
    process.exit();
  }
}

sync();
