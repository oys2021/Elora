import { Router } from 'express';
import { create, getAll, getOne, getItems, update, sync, remove } from '../controllers/order.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Anyone can place an order. Reading needs a sign-in (customers only ever see
// their own, enforced in the controller); changing or deleting is admin-only.
router.post('/orders', create);
router.get('/orders', requireAuth, getAll);
router.get('/orders/:id', requireAuth, getOne);
router.get('/orders/:orderId/items', requireAuth, getItems);
router.put('/orders/:id', requireAdmin, update);
router.put('/orders/:id/sync', requireAdmin, sync);
router.delete('/orders/:id', requireAdmin, remove);

export default router;
