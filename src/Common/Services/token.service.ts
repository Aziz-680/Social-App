import mongoose from 'mongoose';
import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { envConfig } from '../../config';
import UserRepository from '../../DB/Repos/user.repo';
import SecurityService from '../../Common/Services/security.service';
import { BadRequestException, NotFoundException } from '../../Common/Utils/Errors/exceptions';
import { TOKEN_TYPES, USER_ROLES } from '../Types/enums';
// Define the payload structure so TypeScript knows what data is inside the token
export interface ITokenPayload extends JwtPayload {
    _id: string;
    role: string;
}

interface ICreateTokenParams {
    payload: ITokenPayload;
    options?: {
        access?: SignOptions;
        refresh?: SignOptions;
    };
    requiredToken?: string;
}

class TokenService {
    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    generateToken = ({ payload, secret, options }: { payload: string | object | Buffer, secret: string, options?: SignOptions }): string => {
        return jwt.sign(payload, secret, options || {});
    }

    verifyToken = ({ token, secret, options }: { token: string, secret: string, options?: VerifyOptions }): ITokenPayload | string => {
        return jwt.verify(token, secret, options) as ITokenPayload | string;
    }

    detectSignatureByRole = ({ role }: { role: string }) => {
        // We cast to 'any' here or explicitly define the jwt config structure in envConfig
        const jwtSecrets = (envConfig as any).jwt;

        if (role === USER_ROLES.USER) {
            return jwtSecrets.user;
        } else {
            return jwtSecrets.admin;
        }
    }

    getSignatureByTypeAndRole = ({ role, tokenType, both = false }: { role: string, tokenType?: string, both?: boolean }) => {
        const signatures = this.detectSignatureByRole({ role });

        if (both) return signatures;

        let tokenSignature;
        switch (tokenType) {
            case TOKEN_TYPES.ACCESS:
                tokenSignature = signatures.accessSignature;
                break;
            case TOKEN_TYPES.REFRESH:
                tokenSignature = signatures.refreshSignature;
                break;
            default:
                throw new BadRequestException('Invalid Token Type');
        }
        return tokenSignature;
    }

    createLoginToken = ({ payload, options = {}, requiredToken }: ICreateTokenParams) => {
        const signatures = this.getSignatureByTypeAndRole({ role: payload.role, both: true });

        let accessToken: string | undefined;
        let refreshToken: string | undefined;

        switch (requiredToken) {
            case TOKEN_TYPES.ACCESS:
                accessToken = this.generateToken({
                    payload,
                    secret: signatures.accessSignature,
                    options: options.access
                });
                break;
            case TOKEN_TYPES.REFRESH:
                refreshToken = this.generateToken({
                    payload,
                    secret: signatures.refreshSignature,
                    options: options.refresh
                });
                break;
            default:
                accessToken = this.generateToken({
                    payload,
                    secret: signatures.accessSignature,
                    options: options.access
                });
                refreshToken = this.generateToken({
                    payload,
                    secret: signatures.refreshSignature,
                    options: options.refresh
                });
                break;
        }

        return { accessToken, refreshToken };
    }

    decodeToken = async ({ token, tokenType }: { token: string, tokenType: string }) => {
        const data = jwt.decode(token) as ITokenPayload | null;

        if (!data || !data.role) {
            throw new BadRequestException('Invalid Payload');
        }

        const signature = this.getSignatureByTypeAndRole({ role: data.role, tokenType });
        const decodedData = this.verifyToken({ token, secret: signature as string }) as ITokenPayload;

        // Use your BaseRepository method
        const user = await this.userRepo.findDocumentById(decodedData._id);
        if (!user) throw new NotFoundException("User not found");

        // Convert the mongoose document to a plain object so we can modify properties
        const userObj = user.toObject();

        if (userObj.phoneNumber) {
            // Replaced the standalone decrypt call with your new SecurityService
            userObj.phoneNumber = SecurityService.decrypt(userObj.phoneNumber);
        }

        return { user: userObj, decodedData };
    }
}

export default new TokenService();