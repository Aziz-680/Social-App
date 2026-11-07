import { config } from "dotenv";

const rawNodeEnv = process.env.NODE_ENV ?? "development";
const envFileName = rawNodeEnv === "production" ? "prod" : rawNodeEnv === "development" ? "dev" : rawNodeEnv;
config({ path: [`.${envFileName}.env`, ".env"] });

const requiredEnv = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
};

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
}
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 10) {
    throw new Error("TRUST_PROXY_HOPS must be an integer between 0 and 10");
}

const encryptionKey = requiredEnv("ENCRYPTION_KEY");
if (Buffer.byteLength(encryptionKey, "utf8") !== 32) {
    throw new Error("ENCRYPTION_KEY must be exactly 32 bytes for AES-256");
}

const jwtSecret = (name: string, legacyName: string): string => {
    const secret = process.env[name]?.trim() || process.env[legacyName]?.trim();
    if (!secret) {
        throw new Error(`Missing required environment variable: ${name} (or ${legacyName})`);
    }
    if (Buffer.byteLength(secret, "utf8") < 32) {
        throw new Error(`${name} must be at least 32 bytes`);
    }
    return secret;
};

const isProduction = rawNodeEnv === "production" || rawNodeEnv === "prod";
const corsOrigins = process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? (isProduction ? [] : ["http://localhost:3001"]);
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

export default envConfig