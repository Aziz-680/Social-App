"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const Modules_1 = require("./Modules");
const db_connection_js_1 = require("./DB/db.connection.js");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const friend_controller_1 = __importDefault(require("./Modules/Friends/friend.controller"));
const app = (0, express_1.default)();
// function to handle all project controllers
function initializeControllers(app) {
    app.use((0, cookie_parser_1.default)());
    //project controllers
    app.use('/api/auth', Modules_1.authController);
    app.use('/api/user', Modules_1.userController);
    app.use('/api/post', Modules_1.postController);
    app.use('/api/comment', Modules_1.commentController);
    app.use("/api/friend", friend_controller_1.default);
    // Health check route
    app.get('/', (_req, res) => {
        res.json({ message: "Welcome to the Express + TypeScript Server!" });
    });
    // 404 handler
    app.use((_req, res) => {
        res.status(404).json({ message: "Route not found" });
    });
}
// function to handle all common middlewares
function initializeCommonMiddlewares(app) {
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3001',
        credentials: true
    }));
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public/uploads')));
}
initializeCommonMiddlewares(app);
initializeControllers(app);
// DataBase Connection
(0, db_connection_js_1.dbConnection)();
const port = config_1.envConfig.app.port;
app.listen(port, () => {
    console.log('Server is running on port', port);
});
