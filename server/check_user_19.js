const path = require('path');
const workspace = 'e:\\ELearning-System';
require('dotenv').config({ path: path.join(workspace, 'server', '.env') });
const { User, Grade } = require(path.join(workspace, 'server', 'models'));
const sequelize = require(path.join(workspace, 'server', 'config', 'database'));

async function checkUser() {
  try {
    await sequelize.authenticate();
    const user = await User.findByPk(19);
    console.log('--- User 19 Details ---');
    console.log(user ? user.toJSON() : 'Not found');

    const grades = await Grade.findAll();
    console.log('\n--- Grade Levels in DB ---');
    console.log(grades.map(g => ({ id: g.id, level: g.level })));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkUser();
