import { z } from "zod";

export const CreatePostSchema = {
  body: z.object({
    content: z.string().max(2000, "Post is too long").optional(),
    media: z.array(z.string().url()).optional(),
    privacy: z.enum(['public', 'friends', 'only_me']).optional().default('public'),
  }).strict()
};

export const EditPostSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
  }),
  body: z.object({
    content: z.string().min(1, "Post content cannot be empty").max(2000, "Post is too long")
  }).strict()
};

export const DeletePostSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
  })
};

export const CommentSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
  }),
  body: z.object({
    content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long")
  }).strict()
};

export const ReactionSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
  }),
  body: z.object({
    type: z.enum(['like', 'love', 'haha', 'wow', 'sad', 'angry'])
  }).strict()
};

export const RepostSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Post ID format")
  })
};