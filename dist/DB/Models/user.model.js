"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const enums_1 = require("../../Common/Types/enums");
// 1. Sub-schemas for nested arrays
const OTPSchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});
const WorkExperienceSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date }
});
// 2. Main User Schema
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: {
        type: String,
        required: function () { return this.provider === enums_1.PROVIDERS.SYSTEM; }
    },
    age: { type: Number, required: false },
    phoneNumber: { type: String, required: false },
    // Enum fields
    role: { type: String, enum: Object.values(enums_1.USER_ROLES), default: enums_1.USER_ROLES.USER },
    gender: { type: String, enum: Object.values(enums_1.GENDER), required: true },
    status: { type: String, enum: Object.values(enums_1.STATUS), default: enums_1.STATUS.ACTIVE },
    provider: { type: String, enum: Object.values(enums_1.PROVIDERS), default: enums_1.PROVIDERS.SYSTEM },
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
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
const UserModel = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
exports.default = UserModel;
