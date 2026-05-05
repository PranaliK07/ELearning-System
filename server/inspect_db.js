const { Progress, WatchTime, User } = require('./models');
const sequelize = require('./config/database');
require('dotenv').config();

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('DB Connected');

    const progress = await Progress.findAll({
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    console.log('--- Recent Progress Records ---');
    progress.forEach(p => {
      console.log(`User: ${p.UserId}, Content: ${p.ContentId}, WatchTime: ${p.watchTime}, UpdatedAt: ${p.updatedAt}`);
    });

    const watchTimes = await WatchTime.findAll({
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    console.log('\n--- Recent WatchTime Records ---');
    watchTimes.forEach(wt => {
      console.log(`User: ${wt.UserId}, Content: ${wt.ContentId}, Seconds: ${wt.seconds}, Date: ${wt.date}, UpdatedAt: ${wt.updatedAt}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

inspect();
