import { sendData } from '../utils/ApiResponse.js';
import { createUploadSignature } from '../services/upload.service.js';

export const getSignature = async (req, res, next) => {
  try {
    const folder = req.query.folder || 'elora';
    const signature = createUploadSignature(folder);
    sendData(res, signature);
  } catch (err) {
    next(err);
  }
};
