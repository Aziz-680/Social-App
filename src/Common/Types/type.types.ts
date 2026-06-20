import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../../Validators/auth.validators";

export type RegisterBodyType = z.infer<typeof RegisterSchema.body>;

export type LoginBodyType = z.infer<typeof LoginSchema.body>;