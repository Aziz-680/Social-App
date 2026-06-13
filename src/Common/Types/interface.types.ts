import { Document } from 'mongoose';

// 1. Add "extends Document" right here
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    Password: string;
    phoneNumber: string;
    age?: number;
    profilePicture?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IHttpAppError {
    statusCode: number
    code: string;
    details: unknown
}