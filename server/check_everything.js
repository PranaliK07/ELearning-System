const path = require('path');
const workspace = 'e:\\ELearning-System';
require('dotenv').config({ path: path.join(workspace, 'server', '.env') });
const { User, Progress, WatchTime, Assignment, Submission, Grade } = require(path.join(workspace, 'server', 'models'));
const sequelize = require(path.join(workspace, 'server', 'config', 'database'));

async function checkEverything() {
  try {
    await sequelize.authenticate();
    const userCount = await User.count();
    const studentCount = await User.count({ where: { role: 'student' } });
    const progressCount = await Progress.count();
    const wtCount = await WatchTime.count();
    const assignmentCount = await Assignment.count();
    const gradeCount = await Grade.count();

    console.log('--- System Totals ---');
    console.log('Total Users:', userCount);
    console.log('Students:', studentCount);
    console.log('Progress Records:', progressCount);
    console.log('WatchTime Records:', wtCount);
    console.log('Assignments:', assignmentCount);
    console.log('Grades:', gradeCount);

    const students = await User.findAll({ where: { role: 'student' }, limit: 5 });
    console.log('\n--- Sample Students ---');
    console.log(students.map(s => ({ id: s.id, name: s.name, grade: s.grade, GradeId: s.GradeId })));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkEverything();
