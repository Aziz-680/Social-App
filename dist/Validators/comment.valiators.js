"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommentSchema = void 0;
const zod_1 = require("zod");
exports.CreateCommentSchema = {
    body: zod_1.z.object({
        postId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format"),
        content: zod_1.z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long")
    }).strict()
};
