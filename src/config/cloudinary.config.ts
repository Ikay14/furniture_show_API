import { v2 as cloudinary } from 'cloudinary';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloudinary_url: process.env.CLOUDINARY_URL
});


export default cloudinary;
 