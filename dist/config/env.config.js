"use strict";
var _a;
var _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const rawNodeEnv = (_b = process.env.NODE_ENV) !== null && _b !== void 0 ? _b : "development";
const envFileName = rawNodeEnv === "production" ? "prod" : rawNodeEnv === "development" ? "dev" : rawNodeEnv;
(0, dotenv_1.config)({ path: [`.${envFileName}.env`, ".env"] });
const requiredEnv = (name) => {
    var _a;
    const value = (_a = process.env[name]) === null || _a === void 0 ? void 0 : _a.trim();
    if (!value)
        throw new Error(`Missing required environment variable: ${name}`);
    return value;
};
const port = Number((_c = process.env.PORT) !== null && _c !== void 0 ? _c : 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
}
const trustProxyHops = Number((_d = process.env.TRUST_PROXY_HOPS) !== null && _d !== void 0 ? _d : 0);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 10) {
    throw new Error("TRUST_PROXY_HOPS must be an integer between 0 and 10");
}
const encryptionKey = requiredEnv("ENCRYPTION_KEY");
if (Buffer.byteLength(encryptionKey, "utf8") !== 32) {
    throw new Error("ENCRYPTION_KEY must be exactly 32 bytes for AES-256");
}
const jwtSecret = (name, legacyName) => {
    var _a, _b;
    const secret = ((_a = process.env[name]) === null || _a === void 0 ? void 0 : _a.trim()) || ((_b = process.env[legacyName]) === null || _b === void 0 ? void 0 : _b.trim());
    if (!secret) {
        throw new Error(`Missing required environment variable: ${name} (or ${legacyName})`);
    }
    if (Buffer.byteLength(secret, "utf8") < 32) {
        throw new Error(`${name} must be at least 32 bytes`);
    }
    return secret;
};
const isProduction = rawNodeEnv === "production" || rawNodeEnv === "prod";
const corsOrigins = (_e = (_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",").map((origin) => origin.trim()).filter(Boolean)) !== null && _e !== void 0 ? _e : (isProduction ? [] : ["http://localhost:3001"]);
if (isProduction && corsOrigins.length === 0) {
    throw new Error("CORS_ORIGINS must contain at least one production frontend origin");
}
const envConfig = {
    app: {
        port,
        nodeEnv: isProduction ? "production" : rawNodeEnv,
        corsOrigins,
        trustProxyHops,
    },
    database: {
        MONGO_URI: requiredEnv("MONGO_URI"),
    },
    cloudinary: {
        cloudName: requiredEnv("CLOUDINARY_CLOUD_NAME"),
        apiKey: requiredEnv("CLOUDINARY_API_KEY"),
        apiSecret: requiredEnv("CLOUDINARY_API_SECRET"),
    },
    encryption: {
        ENCRYPTION_KEY: encryptionKey,
        IV_LENGTH: 16,
    },
    jwt: {
        user: {
            accessSignature: jwtSecret("USER_ACCESS_SECRET", "JWT_ACCESS_SECRET_USER"),
            refreshSignature: jwtSecret("USER_REFRESH_SECRET", "JWT_REFRESH_SECRET_USER"),
        },
        admin: {
            accessSignature: jwtSecret("ADMIN_ACCESS_SECRET", "JWT_ACCESS_SECRET_ADMIN"),
            refreshSignature: jwtSecret("ADMIN_REFRESH_SECRET", "JWT_REFRESH_SECRET_ADMIN"),
        },
    },
};
exports.default = envConfig;
