import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // Accounts created since Cloudinary's 2024 security update require SHA-256
  // for signed requests; the SDK still defaults to SHA-1.
  signature_algorithm: 'sha256',
});

export default cloudinary;
