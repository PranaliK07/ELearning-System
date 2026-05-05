require('dotenv').config();
const { Assignment, User } = require('../models');

async function checkAssignments() {
  try {
    const assignments = await Assignment.findAll({
      include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'role'] }]
    });
    
    console.log(`\n=== ASSIGNMENTS REPORT ===`);
    assignments.forEach(a => {
      console.log(`- [${a.id}] ${a.title}`);
      console.log(`  Teacher ID: ${a.teacherId}`);
      console.log(`  Teacher Name: ${a.teacher?.name || 'UNKNOWN'}`);
      console.log(`  Teacher Role: ${a.teacher?.role || 'N/A'}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkAssignments();
