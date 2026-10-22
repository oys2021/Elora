import { Router } from 'express';
import { getSignature } from '../controllers/upload.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Signed upload details let the caller put files in the Cloudinary account, so admins only.
router.get('/uploads/signature', requireAdmin, getSignature);

export default router;
