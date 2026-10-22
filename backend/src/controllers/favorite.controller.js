import { sendData } from '../utils/ApiResponse.js';
import { addFavorite, removeFavorite, getFavoritesByUser } from '../services/favorite.service.js';

export const create = async (req, res, next) => {
  try {
    const favorite = await addFavorite(req.params.productId, req.user.id);
    sendData(res, favorite, 201);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await removeFavorite(req.params.productId, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const favorites = await getFavoritesByUser(req.user.id);
    sendData(res, favorites);
  } catch (err) {
    next(err);
  }
};
