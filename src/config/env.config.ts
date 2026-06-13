import { config } from "dotenv";

config({
    path:[ `.${process.env.NODE_ENV}.env` , '.env' ]
})

const envConfig = {
    app:{
        port:process.env.PORT ?? 3000,
        nodeEnv : process.env. NODE_ENV ?? 'dev'
    },
    database:{
        MONGO_URI: process.env.MONGO_URI ?? 'mongodb://localhost:27017/social_app_c45'
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
}

export default envConfig