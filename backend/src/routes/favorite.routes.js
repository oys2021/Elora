import { Router } from 'express';
import { create, remove, getMine } from '../controllers/favorite.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/favorites', requireAuth, getMine);
router.post('/products/:productId/favorites', requireAuth, create);
router.delete('/products/:productId/favorites', requireAuth, remove);

export default router;
