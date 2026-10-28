import { Router } from 'express';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import productVariantRoutes from './productVariant.routes.js';
import orderRoutes from './order.routes.js';
import uploadRoutes from './upload.routes.js';
import reviewRoutes from './review.routes.js';
import commentRoutes from './comment.routes.js';
import favoriteRoutes from './favorite.routes.js';
import bannerRoutes from './banner.routes.js';
import userRoutes from './user.routes.js';
import deliveryZoneRoutes from './deliveryZone.routes.js';
import paymentRoutes from './payment.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use(categoryRoutes);
router.use(productRoutes);
router.use(productVariantRoutes);
router.use(orderRoutes);
router.use(uploadRoutes);
router.use(reviewRoutes);
router.use(commentRoutes);
router.use(favoriteRoutes);
router.use(bannerRoutes);
router.use(userRoutes);
router.use(deliveryZoneRoutes);
router.use(paymentRoutes);
router.use(notificationRoutes);

export default router;