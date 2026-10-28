import { z } from 'zod';
import { sendData } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { getZones, createZone, updateZone, deleteZone } from '../services/deliveryZone.service.js';

const zoneFields = {
  location: z.string({ error: 'Location is required' }).trim().min(1, 'Location is required'),
  firstKgPrice: z.coerce.number({ error: 'Price must be a number' }).min(0, 'Price cannot be negative'),
  extraKgPrice: z.coerce.number({ error: 'Price must be a number' }).min(0, 'Price cannot be negative').default(0),
  deliveryDuration: z
    .string({ error: 'Delivery duration is required' })
    .trim()
    .min(1, 'Delivery duration is required'),
  deliveryMode: z.enum(['DOOR_TO_DOOR', 'OFFICE_PICKUP']).default('DOOR_TO_DOOR'),
  isActive: z.boolean().optional(),
};

const createSchema = z.object(zoneFields);
const updateSchema = z
  .object({ ...zoneFields, location: zoneFields.location.optional(), deliveryDuration: zoneFields.deliveryDuration.optional() })
  .partial({ firstKgPrice: true, extraKgPrice: true, deliveryMode: true })
  .strict();

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;

  const details = {};
  for (const issue of result.error.issues) {
    details[String(issue.path[0] ?? 'form')] ??= issue.message;
  }
  throw new AppError('Please check the highlighted fields', 400, 'VALIDATION_ERROR', details);
}

// GET /delivery-zones            -> active zones, for the checkout picker
// GET /delivery-zones?all=true   -> every zone, for the admin page
export const getAll = async (req, res, next) => {
  try {
    const all = req.query.all === 'true';
    if (all && !req.user?.isAdmin) {
      throw new AppError('You do not have permission to do this', req.user ? 403 : 401, req.user ? 'FORBIDDEN' : 'UNAUTHENTICATED');
    }
    sendData(res, await getZones({ includeInactive: all }));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    sendData(res, await createZone(parse(createSchema, req.body)), 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    sendData(res, await updateZone(req.params.id, parse(updateSchema, req.body)));
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteZone(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
