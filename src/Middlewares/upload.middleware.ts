import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Storage configuration for Profile Pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "social-app-profiles", // Saves here
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    };
  },
});

// 2. Storage configuration for Post Images
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "social-app-posts", // Saves here
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    };
  },
});

// 3. Export specific middlewares for your controllers to use
export const uploadProfile = multer({ storage: profileStorage });
export const uploadPost = multer({ storage: postStorage });