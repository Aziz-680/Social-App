"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const Modules_1 = require("./Modules");
const db_connection_js_1 = require("./DB/db.connection.js");
const app = (0, express_1.default)();
// function to handle all project controllers
function initializeControllers(app) {
    //project controllers
    app.use('/api/auth', Modules_1.authController);
    app.use('/api/user', Modules_1.userController);
    app.use('/api/post', Modules_1.postController);
    app.use('/api/comment', Modules_1.commentController);
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
}
initializeCommonMiddlewares(app);
initializeControllers(app);
// DataBase Connection
(0, db_connection_js_1.dbConnection)();
const port = config_1.envConfig.app.port;
app.listen(port, () => {
    console.log('Server is running on port', port);
});
// start vid 6 week 2
