import { sendData } from '../utils/ApiResponse.js';
import { createComment, getCommentsByProduct, deleteComment } from '../services/comment.service.js';

export const create = async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({
        error: { message: 'body is required', code: 'VALIDATION_ERROR' },
      });
    }
    const comment = await createComment(req.params.productId, req.user.id, { body });
    sendData(res, comment, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getCommentsByProduct(req.params.productId, { page, limit });
    sendData(res, result.comments, 200, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteComment(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
