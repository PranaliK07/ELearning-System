const express = require('express');
const app = express();

const routes = [
    { name: 'auth', path: './routes/auth' },
    { name: 'users', path: './routes/users' },
    { name: 'grades', path: './routes/grades' },
    { name: 'subjects', path: './routes/subjects' },
    { name: 'topics', path: './routes/topics' },
    { name: 'content', path: './routes/content' },
    { name: 'quiz', path: './routes/quiz' },
    { name: 'progress', path: './routes/progress' },
    { name: 'achievements', path: './routes/achievements' },
    { name: 'dashboard', path: './routes/dashboard' },
    { name: 'upload', path: './routes/upload' },
    { name: 'admin', path: './routes/admin' },
    { name: 'teacher', path: './routes/teacher' },
    { name: 'search', path: './routes/search' },
    { name: 'notifications', path: './routes/notifications' }
];

routes.forEach(route => {
    try {
        console.log(`Checking ${route.name}...`);
        const router = require(route.path);
        app.use(`/api/${route.name}`, router);
        console.log(`✅ ${route.name} OK`);
    } catch (e) {
        console.error(`❌ ${route.name} FAILED:`, e.message);
    }
});

console.log('Test complete');
