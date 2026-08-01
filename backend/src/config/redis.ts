import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let hasLoggedError = false;

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Essential setting for BullMQ
  lazyConnect: true,          // Do not connect automatically on startup
  enableOfflineQueue: false,  // Fail fast
  retryStrategy(times) {
    if (times > 1) {
      return null; // Stop reconnect attempts to save resources
    }
    return 1000;
  }
});

redisConnection.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED') {
    if (!hasLoggedError) {
      console.warn(`[Redis] Connection refused at ${redisUrl}. Using in-memory fallback queues.`);
      hasLoggedError = true;
    }
  } else {
    console.error('Redis Connection Error:', err.message);
  }
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis successfully');
});

