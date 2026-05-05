const path = require('path');
const workspace = 'e:\\ELearning-System';
require('dotenv').config({ path: path.join(workspace, 'server', '.env') });
const sequelize = require(path.join(workspace, 'server', 'config', 'database'));

async function checkSchema() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE Progresses");
    console.log('--- Progresses Table Schema ---');
    console.table(results);

    const [wtResults] = await sequelize.query("DESCRIBE WatchTimes");
    console.log('\n--- WatchTimes Table Schema ---');
    console.table(wtResults);

    const [data] = await sequelize.query("SELECT * FROM Progresses LIMIT 5");
    console.log('\n--- Progresses Data Samples ---');
    console.table(data);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSchema();
