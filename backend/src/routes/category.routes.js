import { Router } from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/category.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/categories', requireAdmin, create);
router.get('/categories', getAll);
router.get('/categories/:id', getOne);
router.put('/categories/:id', requireAdmin, update);
router.delete('/categories/:id', requireAdmin, remove);

export default router;
