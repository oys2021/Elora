import { sendData } from '../utils/ApiResponse.js'; // adjust path
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../services/category.service.js';

export const create = async (req, res, next) => {
  try {
    const { name, imageUrl } = req.body;
    if (!name) {
      return res.status(400).json({
        error: { message: 'name  is required', code: 'VALIDATION_ERROR' },
      });
    }
    const category = await createCategory({ name, imageUrl });
    sendData(res, category, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllCategories({ page, limit });

    sendData(res, result.categories, 200, {
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
    const category = await getCategoryById(req.params.id);
    sendData(res, category);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { name, imageUrl } = req.body;
    const category = await updateCategory(req.params.id, { name, imageUrl });
    sendData(res, category);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};