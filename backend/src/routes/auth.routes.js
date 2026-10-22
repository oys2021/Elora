import { Router } from 'express';
import { register, login, forgotPassword, resetPasswordHandler } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordHandler);

export default router;
