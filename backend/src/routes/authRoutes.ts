import { Router } from 'express';
import { login, register, logout, me } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', me);

export default router;
