import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../../Validators/auth.validators";
import { UpdateUserSchema } from "../../Validators/user.validators";
import { CreatePostSchema } from "../../Validators/post.validators";

export type RegisterBodyType = z.infer<typeof RegisterSchema.body>;
export type LoginBodyType = z.infer<typeof LoginSchema.body>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserSchema.body>;
export type CreatePostBodyType = z.infer<typeof CreatePostSchema.body>;

