import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';

export const createCategory = async ({ name, slug, imageUrl }) => {
  slug = name.toLowerCase().trim().replace(/\s+/g, '-');

  const existing = await Category.findOne({ where: { slug } });

  if (existing) {
    throw new AppError('Category with this slug already exists', 409, 'CATEGORY_EXISTS');
  }
  return Category.create({ name, slug, imageUrl });
};

export const getAllCategories = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Category.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    categories: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

export const getCategoryById = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  return category;
};         

export const updateCategory = async (id, { name, slug, imageUrl }) => {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');


  await category.update({ name, slug, imageUrl });
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  await category.destroy();
};