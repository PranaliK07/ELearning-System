const { User } = require('../models');
const logger = require('./logger');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@elearning.com';
    const adminExists = await User.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        firstName: 'System',
        middleName: '',
        lastName: 'Admin',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      logger.info('👤 Default admin account created: admin@elearning.com');
    } else {
      logger.info('ℹ️ Default admin account already exists');
    }
  } catch (error) {
    logger.error('❌ Failed to seed default admin:', error);
  }
};

module.exports = seedAdmin;
