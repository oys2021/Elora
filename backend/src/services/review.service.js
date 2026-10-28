import { sequelize, Review, User, Product } from '../models/index.js';
import AppError from '../utils/AppError.js';

const reviewIncludes = [{ model: User, attributes: ['id', 'name', 'avatar'] }];

const assertValidRating = (rating) => {
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError('rating must be an integer between 1 and 5', 400, 'INVALID_RATING');
  }
  return numericRating;
};

export const createReview = async (productId, userId, { rating, comment }) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const numericRating = assertValidRating(rating);

  const existing = await Review.findOne({ where: { productId, userId } });
  if (existing) throw new AppError('You have already reviewed this product', 409, 'REVIEW_EXISTS');

  const review = await Review.create({ productId, userId, rating: numericRating, comment });
  return Review.findByPk(review.id, { include: reviewIncludes });
};

export const getReviewsByProduct = async (productId, { page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Review.findAndCountAll({
    where: { productId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: reviewIncludes,
  });

  const summary = await Review.findOne({
    where: { productId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount'],
    ],
    raw: true,
  });

  // How many reviews gave each star rating — over ALL reviews, not just this
  // page, so the summary bars stay right however many pages there are.
  const perStar = await Review.findAll({
    where: { productId },
    attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['rating'],
    raw: true,
  });
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of perStar) ratingBreakdown[row.rating] = Number(row.count);

  return {
    ratingBreakdown,
    reviews: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
    averageRating: summary?.averageRating ? Number(summary.averageRating) : 0,
    reviewCount: summary?.reviewCount ? Number(summary.reviewCount) : 0,
  };
};

export const updateReview = async (id, userId, { rating, comment }) => {
  const review = await Review.findByPk(id);
  if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  if (review.userId !== userId) throw new AppError('You can only edit your own review', 403, 'FORBIDDEN');

  const updates = {};
  if (rating !== undefined) updates.rating = assertValidRating(rating);
  if (comment !== undefined) updates.comment = comment;

  await review.update(updates);
  return Review.findByPk(id, { include: reviewIncludes });
};

export const deleteReview = async (id, userId) => {
  const review = await Review.findByPk(id);
  if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  if (review.userId !== userId) throw new AppError('You can only delete your own review', 403, 'FORBIDDEN');
  await review.destroy();
};
