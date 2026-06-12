"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: [3, 'First Name Must Be At Least 3 Characters Long.'],
        maxLength: [50, 'Last Name Must Be Less Than 50 Characters Long.']
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: [3, 'First Name Must Be At Least 3 Characters Long.'],
        maxLength: [50, 'Last Name Must Be Less Than 50 Characters Long.']
    },
    email: {
        type: String,
        required: true,
        index: {
            name: 'email_unique',
            unique: true
        }
    },
    Password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: [18, 'Age must be at least 18'], // Must be between 18 and 60
        max: [60, 'Age cannot exceed 60']
    },
    profilePicture: String
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: true
});
// Create Getter Virtual for fullName
userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});
// Safty check for model`
const User = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
exports.default = User;
