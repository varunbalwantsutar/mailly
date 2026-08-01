import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import {
  getAudiences,
  getAudienceById,
  createAudience,
  deleteAudience,
} from '../controllers/audiencesController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAudiences);
router.post('/', createAudience);
router.get('/:id', getAudienceById);
router.delete('/:id', deleteAudience);

export default router;
