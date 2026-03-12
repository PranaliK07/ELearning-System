const sequelize = require('./config/database');
const {
    Grade, Subject, Topic, User, Content, Quiz,
    Progress, Achievement, WatchTime, Announcement,
    Comment, Like, Bookmark, Notification
} = require('./models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function rebuild() {
    try {
        console.log('🔄 Rebuilding database for MySQL...');

        // Sync all models in order
        await sequelize.sync({ force: true });
        console.log('✅ Tables created successfully');

        // Create default grades
        console.log('🌱 Seeding initial data...');
        const grades = [];
        for (let i = 1; i <= 5; i++) {
            grades.push(await Grade.create({
                level: i,
                name: `Primary ${i}`,
                description: `Grade ${i} educational materials`,
                color: ['#FF5722', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'][i - 1]
            }));
        }

        // Create default subjects for each grade
        console.log('📚 Creating subjects and topics...');
        for (const grade of grades) {
            const subjects = [
                { name: 'Mathematics', icon: 'calculate', color: '#4CAF50' },
                { name: 'Science', icon: 'science', color: '#2196F3' },
                { name: 'English', icon: 'menu_book', color: '#FF9800' }
            ];

            for (const s of subjects) {
                const subject = await Subject.create({
                    ...s,
                    GradeId: grade.id,
                    description: `${s.name} for Class ${grade.level}`,
                    order: 1
                });

                // Create one default topic for each subject
                await Topic.create({
                    name: `Basics of ${s.name}`,
                    description: `Foundational concepts for ${s.name}`,
                    SubjectId: subject.id,
                    order: 1,
                    thumbnail: 'default-topic.png'
                });
            }
        }

        // Create default Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@elearning.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

        await User.create({
            name: 'Platform Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            isActive: true,
            emailVerified: true
        });
        console.log(`✅ Admin user created: ${adminEmail}`);

        // Create default Achievements
        await Achievement.create({
            name: 'First Steps',
            description: 'Create your account',
            icon: 'stars',
            points: 10,
            criteria: JSON.stringify({ type: 'registration' })
        });

        console.log('👍 Database sync and seed complete!');
    } catch (err) {
        console.error('❌ Rebuild failed:', err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

rebuild();
