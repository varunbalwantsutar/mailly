import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connStr = process.env.DATABASE_URL;

async function testConnection() {
  console.log(`Testing PostgreSQL connection using: ${connStr?.replace(/:([^:@]+)@/, ':****@')}`);
  if (!connStr) {
    console.error('DATABASE_URL is not defined in environment.');
    process.exit(1);
  }

  const client = new Client({ connectionString: connStr });
  try {
    await client.connect();
    console.log('🎉 SUCCESS! Connected to PostgreSQL database successfully.');
    await client.end();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
}

testConnection();
