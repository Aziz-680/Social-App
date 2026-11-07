import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { envConfig } from "../config";

cloudinary.config({
  cloud_name: envConfig.cloudinary.cloudName,
  api_key: envConfig.cloudinary.apiKey,
  api_secret: envConfig.cloudinary.apiSecret,
});

const createCloudinaryStorage = (folder: string): multer.StorageEngine => ({
  _handleFile(_req, file, callback) {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
      (error, result) => {
        if (error || !result) {
          callback(error ?? new Error("Cloudinary returned no upload result"));
          return;
        }
        callback(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      },
    );
    file.stream.pipe(uploadStream);
  },
  _removeFile(_req, file, callback) {
    if (!file.filename) {
      callback(null);
      return;
    }
    cloudinary.uploader.destroy(file.filename)
      .then(() => callback(null))
      .catch(callback);
  },
});

const imageUploadOptions = {
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
      return;
    }
    callback(null, true);
  },
};

// 3. Export specific middlewares for your controllers to use
export const uploadProfile = multer({ storage: createCloudinaryStorage("social-app-profiles"), ...imageUploadOptions });
export const uploadPost = multer({ storage: createCloudinaryStorage("social-app-posts"), ...imageUploadOptions });