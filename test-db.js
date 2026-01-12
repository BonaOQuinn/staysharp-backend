/*importing AWS SecretManager commands from client*/
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/*importing postgreSQL*/
import pg from "pg"; 

const { Pool } = pg; 

/*node reads env variables */
const region = process.env.AWS_REGION; 
const secretId = process.env.DB_SECRET_ID; 

const host = process.env.DB_HOST; 
const port = Number(process.env.DB_PORT || "5432") 
const database = process.env.DB_NAME; 


if (!region || !secretId) throw new Error("Missing AWS_REGION or DB_SECRET_ID");
if (!host || !database) throw new Error("Missing DB_HOST or DB_NAME");

async function getDBCreds() {
    const sm = new SecretsManagerClient({ region }); 
    const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId })); 
    const secret = JSON.parse(resp.SecretString)
    return { user: secret.username, password: secret.password }; 
}

async function main() {
  const { user, password } = await getDBCreds();

  // RDS usually expects SSL; this setting is common for initial setup.
  const pool = new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false }
  });

  const result = await pool.query("SELECT now() AS server_time;");
  console.log("Connected! Server time:", result.rows[0].server_time);

  await pool.end();
}

main().catch((err) => {
  console.error("DB connection failed.");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  process.exit(1);
});

