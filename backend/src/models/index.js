import sequelize from '../config/database.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductVariant from './ProductVariant.js';
import User from './user.model.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';
import Comment from './Comment.js';
import Favorite from './Favorite.js';
import Banner from './Banner.js';
import DeliveryZone from './DeliveryZone.js';
import Notification from './Notification.js';
import ContactMessage from './ContactMessage.js';

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Product.hasMany(ProductVariant, { foreignKey: 'productId' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

ProductVariant.hasMany(OrderItem, { foreignKey: 'variantId' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });

Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Comment, { foreignKey: 'productId', onDelete: 'CASCADE' });
Comment.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Favorite, { foreignKey: 'productId', onDelete: 'CASCADE' });
Favorite.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Favorite, { foreignKey: 'userId', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

DeliveryZone.hasMany(Order, { foreignKey: 'deliveryZoneId' });
Order.belongsTo(DeliveryZone, { foreignKey: 'deliveryZoneId' });

export {
  sequelize,
  Category,
  Product,
  ProductVariant,
  User,
  Order,
  OrderItem,
  Review,
  Comment,
  Favorite,
  Banner,
  DeliveryZone,
  Notification,
  ContactMessage,
};
export default {
  Category,
  Product,
  ProductVariant,
  User,
  Order,
  OrderItem,
  Review,
  Comment,
  Favorite,
  Banner,
  DeliveryZone,
  Notification,
  ContactMessage,
};