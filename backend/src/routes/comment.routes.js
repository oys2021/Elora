import { Router } from 'express';
import { create, getAll, remove } from '../controllers/comment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/products/:productId/comments', requireAuth, create);
router.get('/products/:productId/comments', getAll);
router.delete('/comments/:id', requireAuth, remove);

export default router;
