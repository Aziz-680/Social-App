export interface IUser {
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