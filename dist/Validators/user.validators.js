"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../Common/Types/enums"); // Adjust path if needed
exports.UpdateUserSchema = {
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2, "First name must be at least 2 characters").optional(),
        lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters").optional(),
        age: zod_1.z.number().int().positive("Age must be a positive number").max(120, "Invalid age").optional(),
        phoneNumber: zod_1.z.string().min(10, "Invalid phone number length").optional(),
        gender: zod_1.z.nativeEnum(enums_1.GENDER).optional(),
        profilePicture: zod_1.z.string().url("Profile picture must be a valid URL").optional(),
        coverPictures: zod_1.z.array(zod_1.z.string().url()).optional(),
        // Complex nested array validation!
        workExperience: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string().min(2, "Title is required"),
            company: zod_1.z.string().min(2, "Company is required"),
            startDate: zod_1.z.string().datetime().optional(), // Expects an ISO date string
            endDate: zod_1.z.string().datetime().optional()
        })).optional()
    }).strict() // .strict() prevents them from sending extra fields not defined above
};
