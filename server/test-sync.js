const sequelize = require('./config/database');
const models = require('./models');

async function test() {
    try {
        await sequelize.sync({ force: true });
        console.log('Sync success');
    } catch (err) {
        console.error('Sync failed:', err);
    } finally {
        await sequelize.close();
    }
}

test();
