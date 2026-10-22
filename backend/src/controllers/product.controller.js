import { sendData } from '../utils/ApiResponse.js';
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from '../services/product.service.js';

export const create = async (req, res, next) => {
  try {
    const { categoryId, name, description, basePrice, imageUrls, isFeatured, isBestseller } = req.body;
    if (!categoryId || !name || !description || !basePrice) {
      return res.status(400).json({
        error: { message: 'categoryId, name, description, basePrice are required', code: 'VALIDATION_ERROR' },
      });
    }
    const product = await createProduct({ categoryId, name, description, basePrice, imageUrls, isFeatured, isBestseller });
    sendData(res, product, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getAllProducts({ page, limit });
    sendData(res, result.products, 200, {
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
    const product = await getProductBySlug(req.params.slug);
    sendData(res, product);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    sendData(res, product);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};