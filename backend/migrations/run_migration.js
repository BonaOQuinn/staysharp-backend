import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log("dotenv path =", path.join(__dirname, "..", ".env"));
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_NAME =", process.env.DB_NAME);
console.log("ENV keys sample =", Object.keys(process.env).filter(k => k.startsWith("DB_")));


async function getDbCreds() {
  // Always fetch from Secrets Manager (no .env shortcut)
  const region =
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    "us-west-2";

  const secretId = process.env.DB_SECRET_ID;
  if (!secretId) throw new Error("Missing DB_SECRET_ID");

  const sm = new SecretsManagerClient({ region });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (!resp.SecretString) throw new Error("SecretString is empty");

  const secret = JSON.parse(resp.SecretString);

  const user = secret.username;
  const password = secret.password;

  if (!user || !password) throw new Error("Secret missing username/password");

  return { user, password };
}



async function makePool() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  const database = process.env.DB_NAME;

  if (!host) throw new Error("Missing DB_HOST");
  if (!database) throw new Error("Missing DB_NAME");

  const { user, password } = await getDbCreds();

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

async function runMigration(migrationFile) {
  console.log(`🚀 Running migration: ${migrationFile}`);
  
  const pool = await makePool();
  const client = await pool.connect();
  
  try {
    // Read the migration file
    const sqlPath = path.join(__dirname, migrationFile);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found: ${sqlPath}`);
    }
    
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Execute the migration
    await client.query(sql);
    
    console.log(`✅ Migration completed: ${migrationFile}`);
    
    // If it's the barber migration, verify the changes
    if (migrationFile.includes('barber')) {
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'barbers'
        ORDER BY ordinal_position;
      `);
      
      console.log("\n📋 Current barbers table structure:");
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`);
    console.error("Error:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("Usage: node run-migration.js <migration-file>");
  console.error("Example: node run-migration.js 001_add_barber_fields.sql");
  process.exit(1);
}

runMigration(migrationFile).catch(err => {
  console.error(err);
  process.exit(1);
});