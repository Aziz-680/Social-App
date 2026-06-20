import mongoose, { Schema } from 'mongoose';
import { IUser, IOTP, IWorkExperience } from '../../Common/Types/interface.types'; 
import { USER_ROLES, GENDER, STATUS, PROVIDERS } from '../../Common/Types/enums'; 

// 1. Sub-schemas for nested arrays
const OTPSchema = new Schema<IOTP>({
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

const WorkExperienceSchema = new Schema<IWorkExperience>({
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date }
});

// 2. Main User Schema
const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    
    password: { 
        type: String, 
        required: function(this: IUser): boolean { return this.provider === PROVIDERS.SYSTEM; } 
    },
    
    age: { type: Number, required: false },
    phoneNumber: { type: String, required: false },
    
    // Enum fields
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.USER },
    gender: { type: String, enum: Object.values(GENDER), required: true },
    status: { type: String, enum: Object.values(STATUS), default: STATUS.ACTIVE },
    provider: { type: String, enum: Object.values(PROVIDERS), default: PROVIDERS.SYSTEM },
    
    // Media & Booleans
    profilePicture: { type: String, required: false },
    coverPictures: [{ type: String }],
    isEmailVerified: { type: Boolean, default: false },
    googleSub: { type: String, required: false },

    // Nested Arrays
    OTPs: [OTPSchema],
    workExperience: [WorkExperienceSchema]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual Field
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default UserModel;