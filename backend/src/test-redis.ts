import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

async function testRedis() {
  console.log(`Testing Redis connection to: ${redisUrl}`);
  const redis = new Redis(redisUrl, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 1, // Quick fail for testing
  });

  try {
    await redis.ping();
    console.log('🎉 SUCCESS! Connected to Redis successfully.');
    await redis.quit();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed to connect to Redis:', err.message);
    process.exit(1);
  }
}

testRedis();
