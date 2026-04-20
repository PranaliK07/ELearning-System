const { User } = require('./models');
const { sequelize } = require('./models');

async function checkUserSchema() {
  try {
    const describe = await sequelize.getQueryInterface().describeTable('Users');
    console.log('--- Users Schema ---');
    console.log(JSON.stringify(describe, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error describing table:', error);
    process.exit(1);
  }
}

checkUserSchema();
