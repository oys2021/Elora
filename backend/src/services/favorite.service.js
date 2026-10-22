import { Favorite, Product, Category } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const addFavorite = async (productId, userId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const existing = await Favorite.findOne({ where: { productId, userId } });
  if (existing) throw new AppError('Product is already in your favorites', 409, 'FAVORITE_EXISTS');

  return Favorite.create({ productId, userId });
};

export const removeFavorite = async (productId, userId) => {
  const favorite = await Favorite.findOne({ where: { productId, userId } });
  if (!favorite) throw new AppError('Favorite not found', 404, 'FAVORITE_NOT_FOUND');
  await favorite.destroy();
};

export const getFavoritesByUser = async (userId) => {
  return Favorite.findAll({
    where: { userId },
    include: [{ model: Product, include: [Category] }],
    order: [['createdAt', 'DESC']],
  });
};
