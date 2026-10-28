import { sendData } from '../utils/ApiResponse.js';
import { createReview, getReviewsByProduct, updateReview, deleteReview } from '../services/review.service.js';

export const create = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (rating === undefined) {
      return res.status(400).json({
        error: { message: 'rating is required', code: 'VALIDATION_ERROR' },
      });
    }
    const review = await createReview(req.params.productId, req.user.id, { rating, comment });
    sendData(res, review, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getReviewsByProduct(req.params.productId, { page, limit });
    sendData(res, result.reviews, 200, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      averageRating: result.averageRating,
      reviewCount: result.reviewCount,
      ratingBreakdown: result.ratingBreakdown,
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await updateReview(req.params.id, req.user.id, { rating, comment });
    sendData(res, review);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteReview(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
