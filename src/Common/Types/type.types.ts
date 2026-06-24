import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../../Validators/auth.validators";
import { UpdateUserSchema } from "../../Validators/user.validators";

export type UpdateUserBodyType = z.infer<typeof UpdateUserSchema.body>;
export type RegisterBodyType = z.infer<typeof RegisterSchema.body>;
export type LoginBodyType = z.infer<typeof LoginSchema.body>;