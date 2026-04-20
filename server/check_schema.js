const { Notification } = require('./models');
const { sequelize } = require('./models');

async function checkSchema() {
  try {
    const describe = await sequelize.getQueryInterface().describeTable('Notifications');
    console.log('--- Notifications Schema ---');
    console.log(JSON.stringify(describe, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error describing table:', error);
    process.exit(1);
  }
}

checkSchema();
