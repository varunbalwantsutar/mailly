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
} from '../controllers/campaignsController.js';

const router = Router();

// Public routes (no auth required)
router.get('/tracker/open', trackOpen);
router.post('/webhooks/brevo', brevoWebhook);

// Protected routes
router.use(requireAuth);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaignById);
router.post('/:id/duplicate', duplicateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
