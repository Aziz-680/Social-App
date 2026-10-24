import { z } from "zod";
import { GENDER, STATUS } from "../Common/Types/enums"; // Adjust path if needed

export const UpdateUserSchema = {
    body: z.object({
        firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
        lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
        age: z.number().int().positive("Age must be a positive number").max(120, "Invalid age").optional(),
        phoneNumber: z.string().min(10, "Invalid phone number length").optional(),
        gender: z.nativeEnum(GENDER as any).optional(),
        profilePicture: z.string().url("Profile picture must be a valid URL").optional(),
        coverPictures: z.array(z.string().url()).optional(),
        status: z.nativeEnum(STATUS as any, {
            message: "Invalid status value provided"
        }).optional(),
        workExperience: z.array(
            z.object({
                title: z.string().min(2, "Title is required"),
                company: z.string().min(2, "Company is required"),
                startDate: z.string().datetime().optional(), // Expects an ISO date string
                endDate: z.string().datetime().optional()
            })
        ).optional()
    }).strict() // .strict() prevents them from sending extra fields not defined above
};

export const SearchUsersSchema = {
    query: z.object({
        q: z.string().trim().min(1).max(100),
        page: z.coerce.number().int().positive().optional().default(1),
        limit: z.coerce.number().int().positive().max(50).optional().default(20)
    }).strict()
};