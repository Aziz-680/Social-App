import { z } from "zod";
import { GENDER } from "../Common/Types"; 

export const RegisterSchema = {
    body: z.object({
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        
        Password: z.string().regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must be at least 8 characters, include an uppercase letter, lowercase letter, number, and special character"
        ),
        
        phoneNumber: z.string().min(10, "Invalid phone number length"),
        
        gender: z.nativeEnum(GENDER as any).optional() 
    })
};

export const LoginSchema = {
    body: z.object({
        email: z.string().email("Invalid email format"),
        Password: z.string().min(1, "Password is required")
    })
};


