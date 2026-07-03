"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePostSchema = exports.LikePostSchema = exports.CreatePostSchema = void 0;
const zod_1 = require("zod");
exports.CreatePostSchema = {
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, "Post content cannot be empty").max(2000, "Post is too long"),
        media: zod_1.z.array(zod_1.z.string().url("Media items must be valid URLs")).optional(),
    }).strict()
};
exports.LikePostSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    })
};
exports.DeletePostSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    })
};
