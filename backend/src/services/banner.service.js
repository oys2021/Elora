import Banner from '../models/Banner.js';
import sequelize from '../config/database.js';
import AppError from '../utils/AppError.js';

// Public list: only active slides. Admin list: everything.
export const getBanners = async ({ includeInactive = false } = {}) =>
  Banner.findAll({
    where: includeInactive ? {} : { isActive: true },
    order: [
      ['sortOrder', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });

export const createBanner = async ({ imageUrl, linkUrl }) => {
  // New slides go to the end.
  const max = await Banner.max('sortOrder');
  return Banner.create({ imageUrl, linkUrl: linkUrl || null, sortOrder: (max ?? -1) + 1 });
};

export const updateBanner = async (id, data) => {
  const banner = await Banner.findByPk(id);
  if (!banner) throw new AppError('Banner not found', 404, 'BANNER_NOT_FOUND');

  const changes = { ...data };
  if ('linkUrl' in changes) changes.linkUrl = changes.linkUrl || null;
  await banner.update(changes);
  return banner;
};

// ids = every banner id in the desired order.
export const reorderBanners = async (ids) => {
  await sequelize.transaction(async (transaction) => {
    for (const [index, id] of ids.entries()) {
      await Banner.update({ sortOrder: index }, { where: { id }, transaction });
    }
  });
  return getBanners({ includeInactive: true });
};

export const deleteBanner = async (id) => {
  const banner = await Banner.findByPk(id);
  if (!banner) throw new AppError('Banner not found', 404, 'BANNER_NOT_FOUND');
  await banner.destroy();
};
