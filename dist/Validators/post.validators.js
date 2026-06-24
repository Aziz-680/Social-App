"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePostSchema = void 0;
const zod_1 = require("zod");
exports.CreatePostSchema = {
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, "Post content cannot be empty").max(2000, "Post is too long"),
        media: zod_1.z.array(zod_1.z.string().url("Media items must be valid URLs")).optional(),
    }).strict()
};
