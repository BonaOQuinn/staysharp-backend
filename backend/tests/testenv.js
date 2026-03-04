import dotenv from "dotenv";

dotenv.config();

console.log('\n🔍 Checking .env file...\n');

const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

for (const key of required) {
  const value = process.env[key];
  if (value) {
    if (key === 'DB_PASSWORD') {
      console.log(`✅ ${key}: ${'*'.repeat(value.length)} (${value.length} characters)`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: MISSING!`);
  }
}

console.log('\n');