const { Notification } = require('./models');

async function checkRecent() {
  try {
    const lastFive = await Notification.findAll({ 
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    console.log('--- Recent Notifications ---');
    lastFive.forEach(n => {
      console.log(`ID: ${n.id}, Type: ${n.type}, UserID: ${n.userId}, Title: ${n.title}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRecent();
