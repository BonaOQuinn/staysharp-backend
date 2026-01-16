import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlFile(filename) {
  const sqlPath = path.join(__dirname, filename);
  const sql = fs.readFileSync(sqlPath, "utf8");
  const pool = await getPool();
  await pool.query(sql);
  console.log(`✅ Ran ${filename}`);
}

async function main() {
  await runSqlFile("schema.sql");
  await runSqlFile("seed.sql");
  console.log("🎉 Migration complete");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
