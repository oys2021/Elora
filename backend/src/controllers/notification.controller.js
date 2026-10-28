import { sendData } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { listNotifications, countUnread, markRead, markAllRead } from '../services/notification.service.js';

// ?audience=admin is the store's shared feed (admins only); otherwise it's the
// signed-in customer's own notifications.
function scopeOf(req) {
  if (req.query.audience === 'admin') {
    if (!req.user.isAdmin) throw new AppError('Not found', 404, 'NOT_FOUND');
    return { audience: 'ADMIN' };
  }
  return { audience: 'CUSTOMER', userId: req.user.id };
}

export const list = async (req, res, next) => {
  try {
    sendData(res, await listNotifications(scopeOf(req)));
  } catch (err) {
    next(err);
  }
};

export const unreadCount = async (req, res, next) => {
  try {
    sendData(res, { count: await countUnread(scopeOf(req)) });
  } catch (err) {
    next(err);
  }
};

export const readOne = async (req, res, next) => {
  try {
    await markRead(scopeOf(req), req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const readAll = async (req, res, next) => {
  try {
    await markAllRead(scopeOf(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
