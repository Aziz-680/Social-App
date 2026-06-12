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
    }
}

export default envConfig