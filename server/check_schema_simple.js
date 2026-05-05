const path = require('path');
const workspace = 'e:\\ELearning-System';
require('dotenv').config({ path: path.join(workspace, 'server', '.env') });
const sequelize = require(path.join(workspace, 'server', 'config', 'database'));

async function checkSchema() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE Progresses");
    console.log('--- Progresses Columns ---');
    results.forEach(r => console.log(r.Field));

    const [data] = await sequelize.query("SELECT watchTime, UserId, ContentId FROM Progresses LIMIT 5");
    console.log('\n--- Progresses Data Samples ---');
    console.log(data);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSchema();
