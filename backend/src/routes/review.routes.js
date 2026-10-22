import { Router } from 'express';
import { create, getAll, update, remove } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/products/:productId/reviews', requireAuth, create);
router.get('/products/:productId/reviews', getAll);
router.put('/reviews/:id', requireAuth, update);
router.delete('/reviews/:id', requireAuth, remove);

export default router;
