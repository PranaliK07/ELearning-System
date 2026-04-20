const { Doubt } = require('./models');
const { sequelize } = require('./models');

async function checkDoubtSchema() {
  try {
    const describe = await sequelize.getQueryInterface().describeTable('Doubts');
    console.log('--- Doubts Schema ---');
    console.log(JSON.stringify(describe, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error describing table:', error);
    process.exit(1);
  }
}

checkDoubtSchema();
