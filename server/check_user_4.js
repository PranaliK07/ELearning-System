const { User, Grade } = require('./models');

async function checkUser() {
  try {
    const user = await User.findByPk(4, { include: [Grade] });
    console.log('--- User 4 Details ---');
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
