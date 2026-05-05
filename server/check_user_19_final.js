const path = require('path');
const workspace = 'e:\\ELearning-System';
require('dotenv').config({ path: path.join(workspace, 'server', '.env') });
const { User } = require(path.join(workspace, 'server', 'models'));
const sequelize = require(path.join(workspace, 'server', 'config', 'database'));

async function checkUser19() {
  try {
    await sequelize.authenticate();
    const u = await User.findByPk(19);
    if (u) {
      console.log('User 19 Details:', {
        id: u.id,
        name: u.name,
        role: u.role,
        isDeleted: u.isDeleted,
        isActive: u.isActive,
        GradeId: u.GradeId,
        grade: u.grade
      });
    } else {
      console.log('User 19 not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkUser19();
