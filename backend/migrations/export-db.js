import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";

const { Pool } = pg;
dotenv.config();

async function makePool() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  console.log('📡 Connecting to database...');
  console.log(`   Host: ${host}`);
  console.log(`   Database: ${database}`);
  console.log(`   User: ${user}`);

  if (!host || !database || !user || !password) {
    throw new Error("Missing database credentials in .env file");
  }

  return new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
    max: 2
  });
}

async function exportData() {
  console.log('📦 Exporting data from RDS...\n');
  
  const pool = await makePool();
  const client = await pool.connect();

  try {
    const tables = ['locations', 'services', 'barbers', 'working_hours', 'appointments', 'users'];
    const exportData = {};

    for (const table of tables) {
      console.log(`   Exporting ${table}...`);
      const result = await client.query(`SELECT * FROM ${table}`);
      exportData[table] = result.rows;
      console.log(`   ✅ ${result.rows.length} rows exported from ${table}`);
    }

    // Save to file
    const filename = 'database-export.json';
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`\n✅ Export complete! Saved to: ${filename}\n`);
    
    // Also create SQL insert statements
    let sqlStatements = '-- Database Export\n\n';
    
    for (const table of tables) {
      if (exportData[table].length === 0) continue;
      
      sqlStatements += `-- ${table}\n`;
      for (const row of exportData[table]) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === 'boolean') return v;
          if (Array.isArray(v)) return `ARRAY[${v.map(i => `'${i.replace(/'/g, "''")}'`).join(',')}]`;
          if (v instanceof Date) return `'${v.toISOString()}'`;
          return v;
        }).join(', ');
        sqlStatements += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      }
      sqlStatements += '\n';
    }
    
    fs.writeFileSync('database-export.sql', sqlStatements);
    console.log(`✅ SQL export saved to: database-export.sql\n`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

exportData().catch(err => {
  console.error(err);
  process.exit(1);
});