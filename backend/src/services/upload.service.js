import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

export const createUploadSignature = (folder = 'elora') => {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured', 500, 'CLOUDINARY_NOT_CONFIGURED');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
};
