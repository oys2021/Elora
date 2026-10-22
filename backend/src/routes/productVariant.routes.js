import { Router } from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/productVariant.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/product-variants', requireAdmin, create);
router.get('/products/:productId/variants', getAll);
router.get('/product-variants/:id', getOne);
router.put('/product-variants/:id', requireAdmin, update);
router.delete('/product-variants/:id', requireAdmin, remove);

export default router;
