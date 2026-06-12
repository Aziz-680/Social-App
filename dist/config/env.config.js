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
    }
};
exports.default = envConfig;
