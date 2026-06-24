"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const Types_1 = require("../Common/Types");
exports.RegisterSchema = {
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2, "First name must be at least 2 characters"),
        lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must be at least 8 characters, include an uppercase letter, lowercase letter, number, and special character"),
        phoneNumber: zod_1.z.string().min(10, "Invalid phone number length").optional(),
        gender: zod_1.z.nativeEnum(Types_1.GENDER).optional()
    })
};
exports.LoginSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(1, "Password is required")
    })
};
