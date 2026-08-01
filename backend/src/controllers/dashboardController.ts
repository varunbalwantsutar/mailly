import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import prisma from '../config/db.js';

// GET /api/dashboard/stats
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    // 1. Fetch counts
    const [contactCount, segmentCount, totalCampaigns, campaigns] = await Promise.all([
      prisma.contact.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.audience.count({ where: { userId } }),
      prisma.campaign.count({ where: { userId } }),
      prisma.campaign.findMany({
        where: { userId, status: 'SENT' },
      }),
    ]);

    // 2. Compute delivery and open rates
    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;

    campaigns.forEach((c) => {
      totalSent += c.sentCount;
      totalDelivered += c.deliveredCount;
      totalOpened += c.openedCount;
    });

    const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const avgDeliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

    // 3. Fetch recent campaigns
    const recentCampaigns = await prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    const formattedRecentCampaigns = recentCampaigns.map((c) => {
      const openRate = c.sentCount > 0 ? Math.round((c.openedCount / c.sentCount) * 100) : 0;
      const statusLabel =
        c.status === 'SENT'
          ? 'Sent'
          : c.status === 'SENDING'
          ? 'Sending'
          : c.status === 'SCHEDULED'
          ? 'Scheduled'
          : 'Draft';

      return {
        id: c.id,
        campaignName: c.name,
        subject: c.subject,
        status: statusLabel,
        audience: c.recipientType === 'paste' ? 'Pasted List' : 'Audience Segment',
        date: new Date(c.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        recipients: c.sentCount,
        deliveredCount: c.deliveredCount,
        openedCount: c.openedCount,
        openRate,
      };
    });

    // 4. Fetch recent activities
    const [recentOpens, recentCreatedCampaigns] = await Promise.all([
      prisma.campaignRecipient.findMany({
        where: { campaign: { userId }, status: 'OPENED' },
        orderBy: { openedAt: 'desc' },
        take: 3,
        include: { campaign: true },
      }),
      prisma.campaign.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    const activities: any[] = [];

    // Map opens
    recentOpens.forEach((op) => {
      activities.push({
        id: `act-open-${op.id}`,
        type: 'open',
        title: 'Email Opened',
        desc: `${op.email} opened "${op.campaign.name}"`,
        time: op.openedAt ? new Date(op.openedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      });
    });

    // Map campaign updates
    recentCreatedCampaigns.forEach((c) => {
      activities.push({
        id: `act-camp-${c.id}`,
        type: c.status === 'SENT' ? 'send' : 'create',
        title: c.status === 'SENT' ? 'Campaign Sent' : 'Campaign Created',
        desc: `Campaign "${c.name}" was ${c.status.toLowerCase()}`,
        time: new Date(c.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
    });

    // If empty, add mock seed activity logs
    if (activities.length === 0) {
      activities.push(
        {
          id: 'mock-1',
          type: 'create',
          title: 'Welcome Campaign Drafted',
          desc: 'Draft created for NextJS Welcome newsletter',
          time: '10 mins ago',
        },
        {
          id: 'mock-2',
          type: 'import',
          title: 'Contacts Imported',
          desc: '154 contacts imported from wizard',
          time: '2 hours ago',
        }
      );
    }

    // Sort activities by time
    activities.sort((a, b) => b.id.localeCompare(a.id));

    return res.status(200).json({
      stats: {
        contacts: contactCount,
        segments: segmentCount,
        campaigns: totalCampaigns,
        openRate: avgOpenRate,
        deliveryRate: avgDeliveryRate,
      },
      recentCampaigns: formattedRecentCampaigns,
      activities: activities.slice(0, 5),
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
};
