const { User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
    
    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log('👑 Admin user created');
    } else {
      console.log('👑 Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

module.exports = seedAdmin;