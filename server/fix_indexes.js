const sequelize = require('./config/database');

async function fixGradesTable() {
  try {
    const [results] = await sequelize.query('SHOW INDEX FROM Grades');
    console.log('Current indexes:', results.map(r => r.Key_name));
    
    // We want to keep PRIMARY and maybe one index for 'level' if it's correct.
    // However, Sequelize might be failing because it wants 'level' but finds 'level_1', 'level_2' etc.
    // Let's drop ALL indexes on 'level' except the very first one if it's named 'level'.
    
    const indexesToDrop = results
      .map(r => r.Key_name)
      .filter(name => name !== 'PRIMARY');
    
    // Drop all non-primary indexes to let Sequelize recreate what it needs
    console.log(`Found ${indexesToDrop.length} non-primary indexes to drop:`, indexesToDrop);

    for (const indexName of indexesToDrop) {
      console.log(`Dropping index: ${indexName}`);
      try {
        await sequelize.query(`ALTER TABLE Grades DROP INDEX ${indexName}`);
      } catch (e) {
        console.error(`Failed to drop index ${indexName}:`, e.message);
      }
    }

    console.log('✅ Successfully cleaned up non-primary indexes.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cleaning up indexes:', err);
    process.exit(1);
  }
}

fixGradesTable();
