import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';

const QUEUE_NAME = 'email-campaigns';

let useMockQueue = false;
let realQueue: Queue | null = null;
let realWorker: Worker | null = null;

// Mock queue implementation for when Redis is unavailable
class MockQueue {
  async add(name: string, data: any) {
    console.log(`[Mock Queue] Job added: ${name}`);
    console.log(`[Mock Queue] Payload:`, data);
    
    // Simulate async worker execution
    setTimeout(async () => {
      console.log(`[Mock Worker] Starting processing of job: ${name}`);
      // Simulate task processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`[Mock Worker] Completed processing of job: ${name}`);
    }, 500);

    return { id: `mock-job-${Date.now()}`, name, data };
  }
}

// Wrap queue operations
export const emailQueue = new Proxy({} as any, {
  get(target, prop) {
    if (useMockQueue) {
      const mock = new MockQueue();
      return (mock as any)[prop];
    }
    if (!realQueue) {
      initializeRealQueue();
    }
    return (realQueue as any)[prop];
  }
});

function initializeRealQueue() {
  try {
    realQueue = new Queue(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      }
    });

    realWorker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        console.log(`[Worker] Processing email campaign job: ${job.id}`);
        console.log(`[Worker] Payload:`, job.data);
        
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        console.log(`[Worker] Job ${job.id} completed successfully`);
        return { status: 'sent', recipients: job.data.recipientsCount };
      },
      {
        connection: redisConnection,
        autorun: true,
      }
    );

    realWorker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} has completed`);
    });

    realWorker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
    });

    console.log('BullMQ initialized successfully with Redis connection.');
  } catch (err: any) {
    console.error('Failed to initialize BullMQ with Redis, falling back to mock queue:', err.message);
    useMockQueue = true;
  }
}

// Add a connection error handler to redisConnection to enable fallback on connection failure
redisConnection.on('error', (err) => {
  if (!useMockQueue) {
    console.warn('Redis connection issue detected. Switching to in-memory Mock Queue.');
    useMockQueue = true;
  }
});
export { realWorker as emailWorker };
