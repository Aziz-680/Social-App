"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPost = exports.uploadProfile = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config");
cloudinary_1.v2.config({
    cloud_name: config_1.envConfig.cloudinary.cloudName,
    api_key: config_1.envConfig.cloudinary.apiKey,
    api_secret: config_1.envConfig.cloudinary.apiSecret,
});
const createCloudinaryStorage = (folder) => ({
    _handleFile(_req, file, callback) {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"] }, (error, result) => {
            if (error || !result) {
                callback(error !== null && error !== void 0 ? error : new Error("Cloudinary returned no upload result"));
                return;
            }
            callback(null, {
                path: result.secure_url,
                filename: result.public_id,
                size: result.bytes,
            });
        });
        file.stream.pipe(uploadStream);
    },
    _removeFile(_req, file, callback) {
        if (!file.filename) {
            callback(null);
            return;
        }
        cloudinary_1.v2.uploader.destroy(file.filename)
            .then(() => callback(null))
            .catch(callback);
    },
});
const imageUploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
            return;
        }
        callback(null, true);
    },
};
// 3. Export specific middlewares for your controllers to use
exports.uploadProfile = (0, multer_1.default)(Object.assign({ storage: createCloudinaryStorage("social-app-profiles") }, imageUploadOptions));
exports.uploadPost = (0, multer_1.default)(Object.assign({ storage: createCloudinaryStorage("social-app-posts") }, imageUploadOptions));
