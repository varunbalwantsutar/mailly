import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import prisma from '../config/db.js';
import { emailQueue } from '../queues/emailQueue.js';

// GET /api/campaigns
export const getCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { audience: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = campaigns.map((c) => {
      // Calculate rates
      const openRate = c.sentCount > 0 ? Math.round((c.openedCount / c.sentCount) * 100) : 0;
      const deliveryRate = c.sentCount > 0 ? Math.round((c.deliveredCount / c.sentCount) * 100) : 0;

      return {
        id: c.id,
        name: c.name,
        camId: c.camId,
        status: c.status,
        audience: c.recipientType === 'audience' ? (c.audience?.name || 'Target Audience') : 'Custom List',
        date: c.status === 'SENT' ? new Date(c.updatedAt).toLocaleDateString('en-US') : c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString('en-US') : '—',
        time: c.status === 'SENT' ? new Date(c.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
        openRate: c.status === 'SENT' || c.status === 'SENDING' ? openRate : undefined,
        deliveryRate: c.status === 'SENT' || c.status === 'SENDING' ? deliveryRate : undefined,
      };
    });

    return res.status(200).json({ campaigns: formatted });
  } catch (error) {
    console.error('getCampaigns error:', error);
    return res.status(500).json({ error: 'Failed to retrieve campaigns' });
  }
};

// GET /api/campaigns/:id
export const getCampaignById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      include: {
        recipients: {
          orderBy: { email: 'asc' },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Calculate rates
    const openRate = campaign.sentCount > 0 ? Math.round((campaign.openedCount / campaign.sentCount) * 1000) / 10 : 0;
    const deliveryRate = campaign.sentCount > 0 ? Math.round((campaign.deliveredCount / campaign.sentCount) * 1000) / 10 : 0;

    return res.status(200).json({
      campaign: {
        id: campaign.id,
        camId: campaign.camId,
        name: campaign.name,
        subject: campaign.subject,
        body: campaign.body,
        fromName: campaign.fromName,
        fromEmail: campaign.fromEmail,
        status: campaign.status,
        recipientType: campaign.recipientType,
        audienceId: campaign.audienceId,
        tags: campaign.tags,
        customRecipients: campaign.customRecipients,
        sendTiming: campaign.sendTiming,
        scheduledAt: campaign.scheduledAt,
        timezone: campaign.timezone,
        sentCount: campaign.sentCount,
        deliveredCount: campaign.deliveredCount,
        openedCount: campaign.openedCount,
        failedCount: campaign.failedCount,
        openRate,
        deliveryRate,
        recipients: campaign.recipients,
      },
    });
  } catch (error) {
    console.error('getCampaignById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve campaign details' });
  }
};

// POST /api/campaigns
export const createCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const {
      campaignName,
      subjectLine,
      emailBody,
      fromName,
      fromEmail,
      utmSource,
      utmMedium,
      utmCampaign,
      recipientType,
      audienceId,
      tags,
      customRecipients,
      sendTiming,
      sendDate,
      sendTime,
      timezone,
    } = req.body;

    if (!campaignName || !subjectLine || !emailBody) {
      return res.status(400).json({ error: 'Campaign name, subject line, and email body are required' });
    }

    const camId = `CAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const status = sendTiming === 'draft' ? 'DRAFT' : sendTiming === 'later' ? 'SCHEDULED' : 'SENDING';

    let scheduledAt: Date | null = null;
    if (sendTiming === 'later' && sendDate && sendTime) {
      // Parse dates
      scheduledAt = new Date(`${sendDate}T${sendTime}:00`);
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        camId,
        name: campaignName,
        subject: subjectLine,
        body: emailBody,
        fromName: fromName || 'Alex from Mailly',
        fromEmail: fromEmail || 'alex@mailly-marketing.com',
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        status,
        recipientType: recipientType || 'paste',
        audienceId: audienceId || null,
        tags: tags || [],
        customRecipients: customRecipients || [],
        sendTiming: sendTiming || 'now',
        scheduledAt,
        timezone: timezone || 'America/New_York',
      },
    });

    // Schedule queue job if not draft
    if (status === 'SCHEDULED' && scheduledAt) {
      const delay = Math.max(0, scheduledAt.getTime() - Date.now());
      console.log(`Scheduling campaign ${campaign.id} to fire in ${delay}ms`);
      await emailQueue.add(
        'send-campaign',
        { campaignId: campaign.id },
        { delay, jobId: campaign.id }
      );
    } else if (status === 'SENDING') {
      // Send immediately
      console.log(`Queueing campaign ${campaign.id} for immediate delivery`);
      await emailQueue.add(
        'send-campaign',
        { campaignId: campaign.id },
        { jobId: campaign.id }
      );
    }

    return res.status(201).json({ message: 'Campaign successfully created', campaign });
  } catch (error) {
    console.error('createCampaign error:', error);
    return res.status(500).json({ error: 'Failed to create campaign' });
  }
};

// POST /api/campaigns/:id/duplicate
export const duplicateCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const original = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!original) {
      return res.status(404).json({ error: 'Original campaign not found' });
    }

    const camId = `CAM-${Math.floor(1000 + Math.random() * 9000)}`;

    const copy = await prisma.campaign.create({
      data: {
        userId,
        camId,
        name: `${original.name} - Copy`,
        subject: original.subject,
        body: original.body,
        fromName: original.fromName,
        fromEmail: original.fromEmail,
        utmSource: original.utmSource,
        utmMedium: original.utmMedium,
        utmCampaign: original.utmCampaign,
        status: 'DRAFT',
        recipientType: original.recipientType,
        audienceId: original.audienceId,
        tags: original.tags,
        customRecipients: original.customRecipients,
        sendTiming: 'now',
        scheduledAt: null,
        timezone: original.timezone,
      },
    });

    return res.status(201).json({ message: 'Campaign duplicated successfully', campaign: copy });
  } catch (error) {
    console.error('duplicateCampaign error:', error);
    return res.status(500).json({ error: 'Failed to duplicate campaign' });
  }
};

// DELETE /api/campaigns/:id
export const deleteCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Try to remove from BullMQ scheduler if it is active/delayed
    try {
      const job = await emailQueue.getJob(id);
      if (job) {
        await job.remove();
        console.log(`Removed active BullMQ job: ${id}`);
      }
    } catch (queueErr: any) {
      console.warn('Queue cancellation warning:', queueErr.message);
    }

    await prisma.campaign.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('deleteCampaign error:', error);
    return res.status(500).json({ error: 'Failed to delete campaign' });
  }
};

// GET /api/tracker/open
export const trackOpen = async (req: any, res: Response) => {
  try {
    const campaignId = req.query.campaignId as string;
    const email = req.query.email as string;

    if (!campaignId || !email) {
      return res.status(400).json({ error: 'Missing campaignId or email parameter' });
    }

    console.log(`[Tracker] Open event recorded for campaign ${campaignId}, recipient ${email}`);

    // Update CampaignRecipient status
    const recipient = await prisma.campaignRecipient.findFirst({
      where: { campaignId, email },
    });

    if (recipient && recipient.status !== 'OPENED') {
      await prisma.$transaction([
        prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: 'OPENED', openedAt: new Date() },
        }),
        prisma.campaign.update({
          where: { id: campaignId },
          data: { openedCount: { increment: 1 } },
        }),
      ]);
    }

    // Return 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.status(200).send(pixel);
  } catch (error) {
    console.error('trackOpen error:', error);
    return res.status(500).json({ error: 'Internal tracker error' });
  }
};

// POST /api/webhooks/brevo
export const brevoWebhook = async (req: any, res: Response) => {
  try {
    const { event, email, 'message-id': msgId, tags } = req.body;
    console.log(`[Webhook] Brevo event: ${event} for ${email}`);

    // Brevo passes custom parameters or tags.
    // If we passed campaignId as a tag, we can read it.
    const campaignId = tags?.[0] || req.body.campaignId;

    if (campaignId && email) {
      const recipient = await prisma.campaignRecipient.findFirst({
        where: { campaignId, email },
      });

      if (recipient) {
        if (event === 'opened' && recipient.status !== 'OPENED') {
          await prisma.$transaction([
            prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'OPENED', openedAt: new Date() },
            }),
            prisma.campaign.update({
              where: { id: campaignId },
              data: { openedCount: { increment: 1 } },
            }),
          ]);
        } else if (event === 'delivered' && recipient.status === 'PENDING') {
          await prisma.$transaction([
            prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'DELIVERED', deliveredAt: new Date() },
            }),
            prisma.campaign.update({
              where: { id: campaignId },
              data: { deliveredCount: { increment: 1 } },
            }),
          ]);
        }
      }
    }

    return res.status(200).json({ status: 'received' });
  } catch (err) {
    console.error('Brevo webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
};

// POST /api/webhooks/mailgun
export const mailgunWebhook = async (req: any, res: Response) => {
  try {
    const eventData = req.body['event-data'] || req.body;
    const event = eventData?.event;
    const email = eventData?.recipient;
    
    // Read campaignId from user-variables
    const userVars = eventData?.['user-variables'] || {};
    const campaignId = userVars.campaignId;

    console.log(`[Webhook] Mailgun event: ${event} for ${email}, campaign: ${campaignId}`);

    if (campaignId && email) {
      const recipient = await prisma.campaignRecipient.findFirst({
        where: { campaignId, email },
      });

      if (recipient) {
        if (event === 'opened' && recipient.status !== 'OPENED') {
          await prisma.$transaction([
            prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'OPENED', openedAt: new Date() },
            }),
            prisma.campaign.update({
              where: { id: campaignId },
              data: { openedCount: { increment: 1 } },
            }),
          ]);
        } else if (event === 'delivered' && recipient.status === 'PENDING') {
          await prisma.$transaction([
            prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'DELIVERED', deliveredAt: new Date() },
            }),
            prisma.campaign.update({
              where: { id: campaignId },
              data: { deliveredCount: { increment: 1 } },
            }),
          ]);
        }
      }
    }

    return res.status(200).json({ status: 'received' });
  } catch (err) {
    console.error('Mailgun webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
};

// POST /api/webhooks/mailersend
export const mailerSendWebhook = async (req: any, res: Response) => {
  try {
    const { type, data } = req.body;
    const email = data?.email?.recipient?.email;
    const tags = data?.email?.tags || [];
    const campaignId = tags[0];

    console.log(`[Webhook] MailerSend event: ${type} for ${email}, campaign: ${campaignId}`);

    if (campaignId && email) {
      const recipient = await prisma.campaignRecipient.findFirst({
        where: { campaignId, email },
      });

      if (recipient) {
        if (type === 'activity.opened' && recipient.status !== 'OPENED') {
          await prisma.$transaction([
            prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'OPENED', openedAt: new Date() },
            }),
            prisma.campaign.update({
              where: { id: campaignId },
              data: { openedCount: { increment: 1 } },
            }),
          ]);
        } else if (type === 'activity.delivered' && recipient.status === 'PENDING') {
          await prisma.$transaction([
            prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'DELIVERED', deliveredAt: new Date() },
            }),
            prisma.campaign.update({
              where: { id: campaignId },
              data: { deliveredCount: { increment: 1 } },
            }),
          ]);
        }
      }
    }

    return res.status(200).json({ status: 'received' });
  } catch (err) {
    console.error('MailerSend webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
};
