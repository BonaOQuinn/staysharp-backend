import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";

const { Pool } = pg;
dotenv.config();

async function makeSupabasePool() {
  // These will be your NEW Supabase credentials
  const host = process.env.SUPABASE_HOST;
  const port = Number(process.env.SUPABASE_PORT || "5432");
  const database = process.env.SUPABASE_DB;
  const user = process.env.SUPABASE_USER;
  const password = process.env.SUPABASE_PASSWORD;

  console.log('📡 Connecting to Supabase...');
  console.log(`   Host: ${host}`);
  console.log(`   Database: ${database}`);

  if (!host || !database || !user || !password) {
    throw new Error("Missing Supabase credentials in .env file");
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

async function importData() {
  console.log('📥 Importing data to Supabase...\n');
  
  // Read exported data
  const exportData = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));
  
  const pool = await makeSupabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // First, create tables using your schema.sql
    console.log('🔨 Creating tables...');
    const schema = fs.readFileSync('schema.sql', 'utf8');
    await client.query(schema);
    console.log('✅ Tables created\n');

    // Import data in order (respecting foreign keys)
    const tables = ['locations', 'services', 'barbers', 'working_hours', 'appointments', 'users'];
    
    for (const table of tables) {
      if (!exportData[table] || exportData[table].length === 0) {
        console.log(`⚠️  Skipping ${table} (no data)`);
        continue;
      }

      console.log(`   Importing ${table}...`);
      
      for (const row of exportData[table]) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        await client.query(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
          values
        );
      }
      
      console.log(`   ✅ ${exportData[table].length} rows imported to ${table}`);
    }

    await client.query("COMMIT");
    console.log('\n✅ Import complete!\n');

  } catch (error) {
    await client.query("ROLLBACK");
    console.error('❌ Import failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importData().catch(err => {
  console.error(err);
  process.exit(1);
});