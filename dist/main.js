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
const friend_controller_1 = __importDefault(require("./Modules/Friend/friend.controller"));
const app = (0, express_1.default)();
// 1. Initialize Common Middlewares First
function initializeCommonMiddlewares(app) {
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3001',
        credentials: true
    }));
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public/uploads')));
}
// 2. Initialize Controllers
function initializeControllers(app) {
    // Project controllers
    app.use('/api/auth', Modules_1.authController);
    app.use('/api/user', Modules_1.userController);
    app.use('/api/post', Modules_1.postController);
    app.use('/api/comment', Modules_1.commentController);
    app.use('/api/friend', friend_controller_1.default);
    // Health check route
    app.get('/', (_req, res) => {
        res.json({ message: "Welcome to the Express + TypeScript Server!" });
    });
    // Catch-all 404 handler for undefined routes
    app.use((req, res) => {
        res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
    });
    // Global Error Handler Middleware
    app.use((err, _req, res, _next) => {
        console.error("Unhandled Backend Error:", err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message || "Internal Server Error",
            error: err
        });
    });
}
// Execute setup in correct order
initializeCommonMiddlewares(app);
initializeControllers(app);
// Database Connection
(0, db_connection_js_1.dbConnection)();
const port = config_1.envConfig.app.port;
app.listen(port, () => {
    console.log('Server is running on port', port);
});
