import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/deliveryZone.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public: active zones, for the checkout delivery-location picker. (?all=true is admin-only, checked in the controller.)
router.get('/delivery-zones', getAll);
router.post('/delivery-zones', requireAdmin, create);
router.put('/delivery-zones/:id', requireAdmin, update);
router.delete('/delivery-zones/:id', requireAdmin, remove);

export default router;
