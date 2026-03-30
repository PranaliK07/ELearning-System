const { User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminByEmail = await User.findOne({ where: { email: adminEmail } });

    if (adminByEmail) {
      await adminByEmail.update({
        name: 'Administrator',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log('Admin user updated (matched by email)');
      return;
    }

    const adminByRole = await User.findOne({ where: { role: 'admin' } });
    if (adminByRole) {
      await adminByRole.update({
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log('Admin user updated (matched by role)');
      return;
    }

    await User.create({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    console.log('Admin user created');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error running admin seeder:', error);
      process.exit(1);
    });
}
