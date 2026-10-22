import { Router } from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/product.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/products', requireAdmin, create);
router.get('/products', getAll);
router.get('/products/:slug', getOne);   // matches spec: GET /products/:slug
router.put('/products/:id', requireAdmin, update);
router.delete('/products/:id', requireAdmin, remove);

export default router;
