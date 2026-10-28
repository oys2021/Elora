import DeliveryZone from '../models/DeliveryZone.js';
import AppError from '../utils/AppError.js';

// Public list: only active zones (what customers pick from at checkout).
// Admin list: everything, so hidden/retired zones can still be edited.
export const getZones = async ({ includeInactive = false } = {}) =>
  DeliveryZone.findAll({
    where: includeInactive ? {} : { isActive: true },
    order: [
      ['sortOrder', 'ASC'],
      ['location', 'ASC'],
    ],
  });

export const getZoneById = async (id) => {
  const zone = await DeliveryZone.findByPk(id);
  if (!zone) throw new AppError('Delivery zone not found', 404, 'DELIVERY_ZONE_NOT_FOUND');
  return zone;
};

export const createZone = async (data) => {
  const max = await DeliveryZone.max('sortOrder');
  return DeliveryZone.create({ ...data, sortOrder: (max ?? -1) + 1 });
};

export const updateZone = async (id, data) => {
  const zone = await getZoneById(id);
  await zone.update(data);
  return zone;
};

export const deleteZone = async (id) => {
  const zone = await getZoneById(id);
  await zone.destroy();
};
