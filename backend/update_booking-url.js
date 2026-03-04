import pg from "pg";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import dotenv from "dotenv";

const { Pool } = pg;

// Load .env from current directory
dotenv.config();

async function getDbCreds() {
  const region = process.env.AWS_REGION || "us-west-2";
  const secretId = process.env.DB_SECRET_ID;

  if (!secretId) {
    throw new Error("Missing DB_SECRET_ID in .env file");
  }

  console.log('🔐 Fetching credentials from AWS Secrets Manager...');
  
  const sm = new SecretsManagerClient({ region });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  
  if (!resp.SecretString) throw new Error("SecretString is empty");
  const secret = JSON.parse(resp.SecretString);

  if (!secret.username || !secret.password) {
    throw new Error("Secret missing username/password");
  }

  return { user: secret.username, password: secret.password };
}

async function makePool() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  const database = process.env.DB_NAME;

  console.log('📡 Connecting to database...');
  console.log(`   Host: ${host}`);
  console.log(`   Database: ${database}`);
  console.log(`   Port: ${port}`);

  if (!host) throw new Error("Missing DB_HOST in .env file");
  if (!database) throw new Error("Missing DB_NAME in .env file");

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

async function updateBookingUrls() {
  console.log('🔄 Starting to update booking URLs...\n');
  
  const pool = await makePool();
  const client = await pool.connect();

  try {
    // YOUR ACTUAL THE CUT BOOKING URLS (with https://)
    const barberUrls = [
      { name: 'Nolen', url: 'https://book.thecut.co/blenededbynolen' },
      { name: 'AdrianBlendz', url: 'https://book.thecut.co/adriancarmona' },
      { name: 'fadesbyluis', url: 'https://book.thecut.co/Fadesbyluis' },
      { name: 'HowToBarber', url: 'https://book.thecut.co/howtobarber' },
      { name: 'Diego Lopez', url: 'https://book.thecut.co/Daygo-Fadez-dl5vlul' },
      { name: 'Jp.Kuttz', url: 'https://book.thecut.co/JPKUTTZ_-jdj12en' }
    ];

    console.log('📝 Updating booking URLs for each barber:\n');

    for (const barber of barberUrls) {
      const result = await client.query(
        'UPDATE barbers SET booking_url = $1 WHERE name = $2 RETURNING id, name, booking_url',
        [barber.url, barber.name]
      );

      if (result.rowCount > 0) {
        console.log(`✅ ${barber.name}: ${barber.url}`);
      } else {
        console.log(`⚠️  ${barber.name}: NOT FOUND in database`);
      }
    }

    console.log('\n📊 Verification - Current booking URLs:\n');
    const verify = await client.query(
      'SELECT id, name, booking_url FROM barbers ORDER BY id'
    );

    verify.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.name}`);
      console.log(`    → ${row.booking_url || 'NO URL SET'}\n`);
    });

    console.log('✅ Update complete!\n');

  } catch (error) {
    console.error('❌ Error updating booking URLs:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateBookingUrls().catch(err => {
  console.error(err);
  process.exit(1);
});