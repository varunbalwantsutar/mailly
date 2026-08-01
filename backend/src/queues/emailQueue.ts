import { Queue, Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { redisConnection } from '../config/redis.js';
import prisma from '../config/db.js';
import { matchContactWithRules } from '../controllers/audiencesController.js';

const QUEUE_NAME = 'email-campaigns';

let useMockQueue = false;
let realQueue: Queue | null = null;
let realWorker: Worker | null = null;

let transporterCache: nodemailer.Transporter | null = null;

async function getEmailTransporter() {
  if (transporterCache) return transporterCache;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporterCache = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    console.log('[Email Simulator] SMTP credentials not configured. Creating Ethereal Test SMTP Account...');
    const testAccount = await nodemailer.createTestAccount();
    transporterCache = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email Simulator] Ethereal account created: User=${testAccount.user}`);
  }
  return transporterCache;
}

// Core processing logic shared by real worker and mock queue
export async function processCampaignSending(campaignId: string) {
  console.log(`[Queue Processor] Starting Campaign Delivery process for Campaign ID: ${campaignId}`);
  
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      console.error(`[Queue Processor] Campaign not found: ${campaignId}`);
      return { error: 'Campaign not found' };
    }

    if (campaign.status === 'SENT') {
      console.warn(`[Queue Processor] Campaign already sent: ${campaignId}`);
      return { status: 'already_sent' };
    }

    // Update status to SENDING
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' },
    });

    // 1. Resolve recipients
    let recipientEmails: string[] = [];

    if (campaign.recipientType === 'audience' && campaign.audienceId) {
      const audience = await prisma.audience.findUnique({
        where: { id: campaign.audienceId },
      });

      if (audience) {
        const contacts = await prisma.contact.findMany({
          where: { userId: campaign.userId, status: 'ACTIVE' },
        });

        const rules = audience.rules as any[];
        const matched = contacts.filter((c) =>
          matchContactWithRules(c, rules, audience.logicalOperator)
        );
        recipientEmails = matched.map((c) => c.email);
      }
    } else if (campaign.recipientType === 'paste') {
      recipientEmails = campaign.customRecipients || [];
    }

    // Filter valid emails
    recipientEmails = recipientEmails
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const totalRecipients = recipientEmails.length;
    console.log(`[Queue Processor] Resolved ${totalRecipients} recipients for campaign "${campaign.name}"`);

    const transporter = await getEmailTransporter();

    let sent = 0;
    let delivered = 0;
    let failed = 0;

    for (const email of recipientEmails) {
      try {
        // Embed tracking pixel
        const pixelUrl = `http://localhost:5000/api/campaigns/tracker/open?campaignId=${campaign.id}&email=${encodeURIComponent(email)}`;
        const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" />`;
        const htmlBody = `${campaign.body}\n\n${trackingPixel}`;

        // Send email
        const info = await transporter.sendMail({
          from: `"${campaign.fromName}" <${campaign.fromEmail}>`,
          to: email,
          subject: campaign.subject,
          html: htmlBody,
        });

        console.log(`[Email Simulator] Sent successfully to: ${email}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`  [Ethereal Preview URL]: ${previewUrl}`);
        }

        // Record recipient delivery
        const contact = await prisma.contact.findFirst({
          where: { userId: campaign.userId, email },
        });

        await prisma.campaignRecipient.upsert({
          where: {
            campaignId_email: { campaignId: campaign.id, email }
          },
          update: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
            contactId: contact?.id || null,
          },
          create: {
            campaignId: campaign.id,
            email,
            status: 'DELIVERED',
            deliveredAt: new Date(),
            contactId: contact?.id || null,
          },
        });

        sent++;
        delivered++;
      } catch (sendErr: any) {
        console.error(`[Queue Processor] Failed to send email to ${email}:`, sendErr.message);
        failed++;
        
        try {
          await prisma.campaignRecipient.upsert({
            where: {
              campaignId_email: { campaignId: campaign.id, email }
            },
            update: { status: 'FAILED', failedAt: new Date() },
            create: {
              campaignId: campaign.id,
              email,
              status: 'FAILED',
              failedAt: new Date(),
            },
          });
        } catch (dbErr) {}
      }
    }

    // Update campaign summary counts
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        sentCount: sent,
        deliveredCount: delivered,
        failedCount: failed,
      },
    });

    console.log(`[Queue Processor] Campaign completed delivery: sent=${sent}, delivered=${delivered}, failed=${failed}`);
    return { status: 'completed', sent, delivered, failed };
  } catch (error: any) {
    console.error(`[Queue Processor] Critical campaign processing failure:`, error);
    try {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'FAILED' },
      });
    } catch (dbErr) {}
    return { error: error.message };
  }
}

// Mock queue implementation for when Redis is unavailable
class MockQueue {
  async add(name: string, data: any, options?: any) {
    const delay = options?.delay || 0;
    console.log(`[Mock Queue] Job added: ${name} (delayed by ${delay}ms)`);
    
    // Simulate delayed worker execution
    setTimeout(async () => {
      console.log(`[Mock Worker] Starting processing of campaign job: ${name}`);
      await processCampaignSending(data.campaignId);
      console.log(`[Mock Worker] Completed processing of campaign job: ${name}`);
    }, delay || 500);

    return { id: `mock-job-${Date.now()}`, name, data };
  }

  async getJob(id: string) {
    return null; // mock placeholder
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
    // Asynchronously trigger connection to Redis
    redisConnection.connect().catch(() => {});

    realQueue = new Queue(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      }
    });

    realQueue.on('error', (err) => {
      // Switch fallback silently
      useMockQueue = true;
    });

    realWorker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        console.log(`[Worker] Processing email campaign job: ${job.id}`);
        return await processCampaignSending(job.data.campaignId);
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

    realWorker.on('error', (err) => {
      useMockQueue = true;
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
