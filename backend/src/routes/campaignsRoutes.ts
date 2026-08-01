import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  duplicateCampaign,
  deleteCampaign,
  trackOpen,
  brevoWebhook,
  mailgunWebhook,
  mailerSendWebhook,
} from '../controllers/campaignsController.js';

const router = Router();

// Public routes (no auth required)
router.get('/tracker/open', trackOpen);
router.post('/webhooks/brevo', brevoWebhook);
router.post('/webhooks/mailgun', mailgunWebhook);
router.post('/webhooks/mailersend', mailerSendWebhook);

// Protected routes
router.use(requireAuth);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaignById);
router.post('/:id/duplicate', duplicateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
