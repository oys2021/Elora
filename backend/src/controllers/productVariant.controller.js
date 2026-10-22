import { sendData } from '../utils/ApiResponse.js';
import {
  createVariant,
  getVariantsByProduct,
  getVariantById,
  updateVariant,
  deleteVariant,
} from '../services/productVariant.service.js';

export const create = async (req, res, next) => {
  try {
    const { productId, price, lengthOption, densityOption, colorOption, stockQuantity } = req.body;
    if (!productId || !price) {
      return res.status(400).json({
        error: { message: 'productId and price are required', code: 'VALIDATION_ERROR' },
      });
    }
    const variant = await createVariant({
      productId, price, lengthOption, densityOption, colorOption, stockQuantity,
    });
    sendData(res, variant, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getVariantsByProduct(req.params.productId, { page, limit });
    sendData(res, result.variants, 200, {
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
    const variant = await getVariantById(req.params.id);
    sendData(res, variant);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const variant = await updateVariant(req.params.id, req.body);
    sendData(res, variant);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteVariant(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};