const sequelize = require('./config/database');

async function cleanupAllTables() {
  try {
    const [tables] = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'learning_db'");
    
    for (const { TABLE_NAME: tableName } of tables) {
      console.log(`\n--- Cleaning table: ${tableName} ---`);
      
      const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);
      const uniqueIndexes = new Set();
      const duplicateIndexes = [];

      for (const idx of indexes) {
        if (idx.Key_name === 'PRIMARY') continue;
        
        // If it's a foreign key related index, we might want to keep it, 
        // but Sequelize (alter: true) should recreate them if needed.
        // The safest approach to fix "Too many keys" is to drop the ones that look like duplicates.
        // Usually they are named 'columnname', 'columnname_2', 'columnname_3'...
        
        // Let's just drop everything that isn't PRIMARY and let Sequelize recreate.
        duplicateIndexes.push(idx.Key_name);
      }

      const uniqueList = [...new Set(duplicateIndexes)];
      console.log(`Found ${uniqueList.length} indexes to drop on ${tableName}.`);

      for (const indexName of uniqueList) {
        process.stdout.write(`Dropping index ${indexName}... `);
        try {
          await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${indexName}\``);
          console.log('Done.');
        } catch (e) {
          // If dropping fails, it might be a foreign key constraint.
          // In MySQL, you often have to drop the FK before the index.
          console.log(`Failed: ${e.message}`);
        }
      }
    }

    console.log('\n✅ Database cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  }
}

cleanupAllTables();
