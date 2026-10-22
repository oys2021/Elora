import { Router } from 'express';
import { getAll, create, update, reorder, remove } from '../controllers/banner.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public: the active slides for the home page. (?all=true is admin-only, checked in the controller.)
router.get('/banners', getAll);
router.post('/banners', requireAdmin, create);
// Must come before '/banners/:id', or "reorder" would be read as an id.
router.put('/banners/reorder', requireAdmin, reorder);
router.put('/banners/:id', requireAdmin, update);
router.delete('/banners/:id', requireAdmin, remove);

export default router;
