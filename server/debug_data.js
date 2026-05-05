const { Progress, WatchTime, User } = require('./models');
const sequelize = require('./config/database');

async function debug() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const userCount = await User.count();
    console.log('Total users:', userCount);

    const progressCount = await Progress.count();
    console.log('Total progress records:', progressCount);
    
    const totalProgressSeconds = await Progress.sum('watchTime') || 0;
    console.log('Sum of Progress.watchTime:', totalProgressSeconds);

    const wtCount = await WatchTime.count();
    console.log('Total WatchTime records:', wtCount);
    
    const totalWtSeconds = await WatchTime.sum('seconds') || 0;
    console.log('Sum of WatchTime.seconds:', totalWtSeconds);

    const students = await User.findAll({ where: { role: 'student' }, limit: 5 });
    for (const student of students) {
      const pSum = await Progress.sum('watchTime', { where: { UserId: student.id } }) || 0;
      console.log(`Student ${student.email} (ID: ${student.id}) total watch time: ${pSum}s`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
