import { literal } from 'sequelize';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';

// Variant summary computed in SQL so pagination and counts stay correct.
const variantStat = (expr, alias) => [
  literal(`(SELECT ${expr} FROM product_variants v WHERE v."productId" = "Product"."id")`),
  alias,
];
const variantAttributes = [
  variantStat('COUNT(*)::int', 'variantCount'),
  variantStat('COALESCE(SUM(v."stockQuantity"), 0)::int', 'totalStock'),
  // "From" price = cheapest variant the customer can actually buy (falls back to
  // the cheapest overall when everything is out of stock).
  variantStat(
    'COALESCE(MIN(v."price") FILTER (WHERE v."stockQuantity" > 0), MIN(v."price"))::float8',
    'minPrice'
  ),
];

export const createProduct = async (data) => {
  const category = await Category.findByPk(data.categoryId);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  data.slug = data.name.toLowerCase().trim().replace(/\s+/g, '-');

  const existing = await Product.findOne({ where: { slug: data.slug } });
  if (existing) throw new AppError('Product with this slug already exists', 409, 'PRODUCT_EXISTS');

  return Product.create(data);
};

export const getAllProducts = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    attributes: { include: variantAttributes },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: Category,
  });

  return {
    products: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    where: { slug },
    attributes: { include: variantAttributes },
    include: Category,
  });
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return product;
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

//   if (data.slug && data.slug !== product.slug) {
//     const existing = await Product.findOne({ where: { slug: data.slug } });
//     if (existing) throw new AppError('Product with this slug already exists', 409, 'PRODUCT_EXISTS');
//   }

  await product.update(data);
  return product;
};    

export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  await product.destroy();
};
