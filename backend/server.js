import express from "express";
import pg from "pg";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const { Pool } = pg;

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Cache so we don't hit Secrets Manager and recreate Pool on every request
let cachedPool = null;

async function getDbCreds() {
  const region = process.env.AWS_REGION;
  const secretId = process.env.DB_SECRET_ID;

  if (!region) throw new Error("Missing AWS_REGION");
  if (!secretId) throw new Error("Missing DB_SECRET_ID");

  const sm = new SecretsManagerClient({ region });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));

  if (!resp.SecretString) throw new Error("SecretString is empty");
  const secret = JSON.parse(resp.SecretString);

  if (!secret.username || !secret.password) {
    throw new Error("Secret missing username/password fields");
  }

  return { user: secret.username, password: secret.password };
}

async function getPool() {
  if (cachedPool) return cachedPool;

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  const database = process.env.DB_NAME;

  if (!host) throw new Error("Missing DB_HOST");
  if (!database) throw new Error("Missing DB_NAME");

  const { user, password } = await getDbCreds();

  cachedPool = new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false }, // OK for now; can tighten later
    max: 5, // small pool for small service
    idleTimeoutMillis: 30_000
  });

  return cachedPool;
}

// Basic app health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// DB health check
app.get("/db-health", async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.query("SELECT 1 AS ok;");
    res.json({ db: r.rows[0]?.ok === 1 ? "ok" : "fail" });
  } catch (err) {
    res.status(500).json({
      db: "fail",
      error: err?.message || String(err)
    });
  }
});


/* ********************API ENDPOINTS**************************** */
app.get("/api/services", async (request, response) => {
  const pool = await getPool(); 
  const req = await pool.query("SELECT id, name, duration_minutes, price_cents, FROM services WHERE is_active= true ORDER BY id;")
  response.json(req.rows)
})

app.get("/api/barbers", async (request, response) => {
  const pool = await getPool(); 
  const req = await pool.query("SELECT id, name FROM barbers WHERE is_active=true ORDER BY id"); 
  response.json(req.rows)
})






