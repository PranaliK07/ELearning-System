const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('Tables:', tables);

    // Fix WatchTime table
    const watchTimeCols = await queryInterface.describeTable('WatchTimes');
    if (!watchTimeCols.seconds) {
      console.log('Adding "seconds" column to WatchTimes...');
      await queryInterface.addColumn('WatchTimes', 'seconds', {
        type: require('sequelize').DataTypes.INTEGER,
        defaultValue: 0
      });
      
      if (watchTimeCols.minutes) {
        console.log('Migrating data from "minutes" to "seconds"...');
        await sequelize.query('UPDATE WatchTimes SET seconds = minutes * 60', { type: QueryTypes.UPDATE });
        // Optionally remove minutes column
        // await queryInterface.removeColumn('WatchTimes', 'minutes');
      }
    } else {
      console.log('"seconds" column already exists in WatchTimes.');
    }

    // Fix Progress table
    const progressCols = await queryInterface.describeTable('Progresses');
    if (!progressCols.watchTime) {
      console.log('Adding "watchTime" column to Progresses...');
      await queryInterface.addColumn('Progresses', 'watchTime', {
        type: require('sequelize').DataTypes.INTEGER,
        defaultValue: 0
      });
    } else {
      console.log('"watchTime" column already exists in Progresses.');
    }

    console.log('DB Columns fixed successfully.');
  } catch (err) {
    console.error('Error fixing DB columns:', err);
  } finally {
    process.exit();
  }
}

fix();
