import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Give Cloudinary our credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Tell Multer to send files straight to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'social-app-posts', // Cloudinary will create this folder for you!
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Block PDFs or malicious files
        };
    },
});

// 3. Export the middleware so we can use it in our routes
export const upload = multer({ storage: storage });