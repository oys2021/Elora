import { literal, Op } from 'sequelize';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

// Per-user activity, computed in SQL so paging and search stay correct.
const orderStat = (expr, alias, extraWhere = '') => [
  literal(`(SELECT ${expr} FROM orders o WHERE o."userId" = "User"."id"${extraWhere})`),
  alias,
];

const activityAttributes = [
  orderStat('COUNT(*)::int', 'orderCount'),
  // Only paid orders count as money spent.
  orderStat('COALESCE(SUM(o."totalAmount"), 0)::float8', 'totalSpent', ` AND o.status = 'PAID'`),
  orderStat('MAX(o."createdAt")', 'lastOrderAt'),
  // The hash itself is never sent, only whether one exists (a password account).
  [literal('("User"."passwordHash" IS NOT NULL)'), 'hasPassword'],
];

const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

export const getAllUsers = async ({ page = 1, limit = 10, search }) => {
  const offset = (page - 1) * limit;
  const term = search?.trim();

  const where = term
    ? {
        [Op.or]: ['name', 'email', 'username'].map((field) => ({
          [field]: { [Op.iLike]: `%${escapeLike(term)}%` },
        })),
      }
    : undefined;

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { include: activityAttributes },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { users: rows, total: count, page, totalPages: Math.ceil(count / limit) };
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getUserById = async (id) => {
  if (!UUID.test(id)) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  const user = await User.findByPk(id, { attributes: { include: activityAttributes } });
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return user;
};
