import pg from "pg";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const { Pool } = pg;

let cachedPool = null;

async function getDbCreds() {
  const region = process.env.AWS_REGION;
  const secretId = process.env.DB_SECRET_ID;

  const sm = new SecretsManagerClient({ region });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  const secret = JSON.parse(resp.SecretString);

  return { user: secret.username, password: secret.password };
}

export async function getPool() {
  if (cachedPool) return cachedPool;

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  const database = process.env.DB_NAME;

  const { user, password } = await getDbCreds();

  cachedPool = new Pool({
    host, port, database, user, password,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000
  });

  return cachedPool;
}
