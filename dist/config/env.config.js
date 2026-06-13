"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    path: [`.${process.env.NODE_ENV}.env`, '.env']
});
const envConfig = {
    app: {
        port: (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000,
        nodeEnv: (_b = process.env.NODE_ENV) !== null && _b !== void 0 ? _b : 'dev'
    },
    database: {
        MONGO_URI: (_c = process.env.MONGO_URI) !== null && _c !== void 0 ? _c : 'mongodb://localhost:27017/social_app_c45'
    },
    encryption: {
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
        IV_LENGTH: process.env.IV_LENGTH || '16'
    },
    jwt: {
        user: {
            accessSignature: process.env.USER_ACCESS_SECRET || 'fallbackUserAccessSecret',
            refreshSignature: process.env.USER_REFRESH_SECRET || 'fallbackUserRefreshSecret'
        },
        admin: {
            accessSignature: process.env.ADMIN_ACCESS_SECRET || 'fallbackAdminAccessSecret',
            refreshSignature: process.env.ADMIN_REFRESH_SECRET || 'fallbackAdminRefreshSecret'
        }
    }
};
exports.default = envConfig;
