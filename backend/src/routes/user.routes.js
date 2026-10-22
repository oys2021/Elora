import { Router } from 'express';
import { getAll, getOne } from '../controllers/user.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Read-only, and admin-only: it lists customers' names and emails.
router.get('/users', requireAdmin, getAll);
router.get('/users/:id', requireAdmin, getOne);

export default router;
