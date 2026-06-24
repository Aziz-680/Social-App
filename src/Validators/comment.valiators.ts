import { z } from "zod";

export const CreateCommentSchema = {
    body: z.object({
        postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format"),
        content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long")
    }).strict()
};