import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DB = process.env.APP_DB_NAME || "staysharp"; // the DB we want to create/use

function assertSafeDbName(name) {
  // only allow simple DB names (avoid SQL injection)
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Unsafe APP_DB_NAME: ${name}`);
  }
}

async function getDbCreds() {
  const region = process.env.AWS_REGION;
  const secretId = process.env.DB_SECRET_ID;
  if (!region) throw new Error("Missing AWS_REGION");
  if (!secretId) throw new Error("Missing DB_SECRET_ID");

  const sm = new SecretsManagerClient({ region });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (!resp.SecretString) throw new Error("SecretString is empty");

  const secret = JSON.parse(resp.SecretString);
  return { user: secret.username, password: secret.password };
}

async function makePool(database) {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  if (!host) throw new Error("Missing DB_HOST");

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

async function ensureDatabaseExists(adminPool, dbName) {
  const exists = await adminPool.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  if (exists.rowCount > 0) {
    console.log(`✅ Database already exists: ${dbName}`);
    return;
  }

  // CREATE DATABASE cannot be parameterized, so we validated dbName above
  await adminPool.query(`CREATE DATABASE ${dbName}`);
  console.log(`✅ Created database: ${dbName}`);
}

async function runSqlFile(pool, filename) {
  const sqlPath = path.join(__dirname, filename);
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log(`✅ Ran ${filename} on ${pool.options.database}`);
}

async function main() {
  assertSafeDbName(TARGET_DB);

  console.log("🚀 Migration start");
  console.log("Target DB:", TARGET_DB);

  // 1) Connect to postgres admin DB
  const adminPool = await makePool("postgres");

  // 2) Create staysharp DB if missing
  await ensureDatabaseExists(adminPool, TARGET_DB);

  // 3) Connect to staysharp and run schema/seed
  const appPool = await makePool(TARGET_DB);
  await runSqlFile(appPool, "schema.sql");
  await runSqlFile(appPool, "seed.sql");

  await appPool.end();
  await adminPool.end();

  console.log("🎉 Migration complete");
}

main().catch((e) => {
  console.error("❌ Migration failed:", e?.message || e);
  console.error(e);
  process.exit(1);
});

