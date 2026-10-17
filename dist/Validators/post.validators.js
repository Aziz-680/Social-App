"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepostSchema = exports.ReactionSchema = exports.CommentSchema = exports.DeletePostSchema = exports.EditPostSchema = exports.CreatePostSchema = void 0;
const zod_1 = require("zod");
exports.CreatePostSchema = {
    body: zod_1.z.object({
        content: zod_1.z.string().max(2000, "Post is too long").optional(),
        media: zod_1.z.array(zod_1.z.string().url()).optional(),
        privacy: zod_1.z.enum(['public', 'friends', 'only_me']).optional().default('public'),
    }).strict()
};
exports.EditPostSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    }),
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, "Post content cannot be empty").max(2000, "Post is too long")
    }).strict()
};
exports.DeletePostSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    })
};
exports.CommentSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    }),
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long")
    }).strict()
};
exports.ReactionSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    }),
    body: zod_1.z.object({
        type: zod_1.z.enum(['like', 'love', 'haha', 'wow', 'sad', 'angry'])
    }).strict()
};
exports.RepostSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    })
};
