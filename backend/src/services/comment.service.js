import { Comment, User, Product } from '../models/index.js';
import AppError from '../utils/AppError.js';

const commentIncludes = [{ model: User, attributes: ['id', 'name', 'avatar'] }];

export const createComment = async (productId, userId, { body }) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  if (!body || !body.trim()) {
    throw new AppError('body is required', 400, 'VALIDATION_ERROR');
  }

  const comment = await Comment.create({ productId, userId, body: body.trim() });
  return Comment.findByPk(comment.id, { include: commentIncludes });
};

export const getCommentsByProduct = async (productId, { page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Comment.findAndCountAll({
    where: { productId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: commentIncludes,
  });

  return {
    comments: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

export const deleteComment = async (id, userId) => {
  const comment = await Comment.findByPk(id);
  if (!comment) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  if (comment.userId !== userId) throw new AppError('You can only delete your own comment', 403, 'FORBIDDEN');
  await comment.destroy();
};
