import { z } from 'zod';
import { sendData } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import {
  getBanners,
  createBanner,
  updateBanner,
  reorderBanners,
  deleteBanner,
} from '../services/banner.service.js';

const httpUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .refine((v) => /^https?:\/\//i.test(v), 'Must start with http:// or https://');

// A banner link is rendered as an <a href>, so only allow a page on this site
// ("/products") or a web address. This blocks things like "javascript:...".
const linkUrl = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/i.test(v),
    'Use a page on this site like /products, or a full https:// address'
  )
  .nullish();

const createSchema = z.object({ imageUrl: httpUrl, linkUrl });
const updateSchema = z
  .object({
    imageUrl: httpUrl.optional(),
    linkUrl,
    isActive: z.boolean().optional(),
  })
  .strict();
const reorderSchema = z.object({ ids: z.array(z.uuid()).min(1) });

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;

  const details = {};
  for (const issue of result.error.issues) {
    details[String(issue.path[0] ?? 'form')] ??= issue.message;
  }
  throw new AppError('Please check the highlighted fields', 400, 'VALIDATION_ERROR', details);
}

// GET /banners            -> active slides for the storefront
// GET /banners?all=true   -> every slide, for the admin page
export const getAll = async (req, res, next) => {
  try {
    const all = req.query.all === 'true';
    // Hidden banners are for the admin page only.
    if (all && !req.user?.isAdmin) {
      throw new AppError('You do not have permission to do this', req.user ? 403 : 401, req.user ? 'FORBIDDEN' : 'UNAUTHENTICATED');
    }
    sendData(res, await getBanners({ includeInactive: all }));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    sendData(res, await createBanner(parse(createSchema, req.body)), 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    sendData(res, await updateBanner(req.params.id, parse(updateSchema, req.body)));
  } catch (err) {
    next(err);
  }
};

export const reorder = async (req, res, next) => {
  try {
    sendData(res, await reorderBanners(parse(reorderSchema, req.body).ids));
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteBanner(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
