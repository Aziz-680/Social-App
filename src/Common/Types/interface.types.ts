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
    password: string; 
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
    lastLogin?: Date;

    friends: Types.ObjectId[];
    friendRequests: Types.ObjectId[];
    sentRequests: Types.ObjectId[];
}



export interface ICommentReaction {
    userId: Types.ObjectId;
    type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface IComment {
    _id?: Types.ObjectId | string;
    userId: Types.ObjectId;
    postId?: Types.ObjectId;
    content: string;
    reactions?: ICommentReaction[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IReaction {
    userId: Types.ObjectId;
    type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface IPost extends Document {
    userId: Types.ObjectId; 
    content: string;
    media?: string[]; 
    privacy?: 'public' | 'friends' | 'only_me';
    likes?: Types.ObjectId[]; 
    reactions?: IReaction[];
    comments?: IComment[];
    isRepost?: boolean;
    originalPostId?: Types.ObjectId | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IHttpAppError {
    statusCode: number
    code: string;
    details: unknown
}

