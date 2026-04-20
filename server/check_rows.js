const { Notification } = require('./models');

async function checkRows() {
  try {
    const count = await Notification.count();
    console.log(`Total notifications: ${count}`);
    const last = await Notification.findOne({ order: [['createdAt', 'DESC']] });
    if (last) {
      console.log('Last notification:', JSON.stringify(last, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error counting rows:', error);
    process.exit(1);
  }
}

checkRows();
