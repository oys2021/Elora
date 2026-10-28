import { Router } from 'express';
import { list, unreadCount, readOne, readAll } from '../controllers/notification.controller.js';
import { sendContactMessage } from '../controllers/contact.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Contact page: anyone can send a message.
router.post('/contact', sendContactMessage);

// Bell icon. Add ?audience=admin for the store's feed (admins only).
router.get('/notifications', requireAuth, list);
router.get('/notifications/unread-count', requireAuth, unreadCount);
router.post('/notifications/read-all', requireAuth, readAll);
router.post('/notifications/:id/read', requireAuth, readOne);

export default router;
