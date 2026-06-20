import { Document, Types } from 'mongoose';
import { USER_ROLES, GENDER, STATUS, PROVIDERS } from './enums';

// Sub-interfaces for nested arrays in the User model
export interface IOTP {
    code: string;
    expiresAt: Date;
}

export interface IWorkExperience {
    title: string;
    company: string;
    startDate?: Date;
    endDate?: Date;
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string; // Changed to lowercase to match screenshot!
    age?: number;
    phoneNumber?: string;
    role: USER_ROLES;
    gender: GENDER;
    status: STATUS;
    profilePicture?: string;
    coverPictures?: string[];
    isEmailVerified?: boolean;
    OTPs?: IOTP[];
    workExperience?: IWorkExperience[];
    provider: PROVIDERS;
    googleSub?: string;
    
    // Kept for Mongoose timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IHttpAppError {
    statusCode: number
    code: string;
    details: unknown
}