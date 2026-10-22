import { sendData } from '../utils/ApiResponse.js';
import { getAllUsers, getUserById } from '../services/user.service.js';

export const getAll = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const result = await getAllUsers({ page, limit, search: req.query.search });
    sendData(res, result.users, 200, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    sendData(res, await getUserById(req.params.id));
  } catch (err) {
    next(err);
  }
};
