import { ProductVariant, Product } from '../models/index.js';
import AppError from '../utils/AppError.js';

const clean = (value, max) =>
  String(value ?? '').replace(/[^a-z0-9]/gi, '').slice(0, max).toUpperCase();

// e.g. "Brazilian Body Wave Bundles" + "54" + "23x45" + "Yellow" -> BBWB-54-23X45-YEL-7K2F
const buildSku = (product, { lengthOption, densityOption, colorOption }) => {
  const initials = product.name
    .split(/\s+/)
    .map((word) => clean(word, 1))
    .join('')
    .slice(0, 4);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return [initials, clean(lengthOption, 4), clean(densityOption, 8), clean(colorOption, 3), suffix]
    .filter(Boolean)
    .join('-');
};

const generateUniqueSku = async (product, options) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const sku = buildSku(product, options);
    if (!(await ProductVariant.findOne({ where: { sku } }))) return sku;
  }
  throw new AppError('Could not generate a unique SKU, please try again', 500, 'SKU_GENERATION_FAILED');
};

export const createVariant = async (data) => {
  const product = await Product.findByPk(data.productId);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  // SKU is always generated server-side; any client-supplied value is ignored.
  return ProductVariant.create({ ...data, sku: await generateUniqueSku(product, data) });
};

export const getVariantsByProduct = async (productId, { page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await ProductVariant.findAndCountAll({
    where: { productId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    variants: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

export const getVariantById = async (id) => {
  const variant = await ProductVariant.findByPk(id);
  if (!variant) throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
  return variant;
};

export const updateVariant = async (id, data) => {
  const variant = await ProductVariant.findByPk(id);
  if (!variant) throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');

  if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
    throw new AppError('stockQuantity cannot be negative', 400, 'INVALID_STOCK_QUANTITY');
  }

  const { sku, productId, ...changes } = data; // SKU and parent product are immutable
  await variant.update(changes);
  return variant;
};

export const deleteVariant = async (id) => {
  const variant = await ProductVariant.findByPk(id);
  if (!variant) throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
  await variant.destroy();
};