import { z } from "zod";

export const CreatePostSchema = {
    body: z.object({
        content: z.string().min(1, "Post content cannot be empty").max(2000, "Post is too long"),
        media: z.array(z.string().url("Media items must be valid URLs")).optional(),
    }).strict()
};

export const LikePostSchema = {
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
    })
};