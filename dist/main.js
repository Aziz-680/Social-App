"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const friend_controller_1 = __importDefault(require("./Modules/Friend/friend.controller"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const app = (0, express_1.default)();
app.set('trust proxy', config_1.envConfig.app.trustProxyHops);
// 1. Initialize Common Middlewares First
function initializeCommonMiddlewares(app) {
    app.use((0, helmet_1.default)());
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({
        origin: config_1.envConfig.app.corsOrigins,
        credentials: true
    }));
    const authRateLimit = (0, express_rate_limit_1.rateLimit)({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { message: 'Too many authentication attempts. Try again later.' },
    });
    app.use(['/api/auth/login', '/api/auth/register', '/api/auth/google'], authRateLimit);
}
// 2. Initialize Controllers
function initializeControllers(app) {
    // Project controllers
    app.use('/api/auth', Modules_1.authController);
    app.use('/api/user', Modules_1.userController);
    app.use('/api/post', Modules_1.postController);
    app.use('/api/comment', Modules_1.commentController);
    app.use('/api/notification', Modules_1.notificationController);
    app.use('/api/friend', friend_controller_1.default);
    // Liveness is process-only; readiness also verifies the database connection.
    app.get('/health/live', (_req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    app.get('/health/ready', (_req, res) => {
        const isReady = mongoose_1.default.connection.readyState === 1;
        res.status(isReady ? 200 : 503).json({ status: isReady ? 'ready' : 'not_ready' });
    });
    app.get('/', (_req, res) => {
        res.json({ message: "Welcome to the Social App API" });
    });
    // Catch-all 404 handler for undefined routes
    app.use((req, res) => {
        res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
    });
    // Global Error Handler Middleware
    app.use((err, _req, res, _next) => {
        console.error("Unhandled Backend Error:", err);
        const requestedStatus = Number(err.statusCode);
        const statusCode = requestedStatus >= 400 && requestedStatus < 500 ? requestedStatus : 500;
        res.status(statusCode).json({
            message: statusCode === 500 ? "Internal Server Error" : (err.message || "Request failed"),
        });
    });
}
// Execute setup in correct order
initializeCommonMiddlewares(app);
initializeControllers(app);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_connection_js_1.dbConnection)();
    const server = app.listen(config_1.envConfig.app.port, () => {
        console.log(`Server is listening on port ${config_1.envConfig.app.port}`);
    });
    const shutdown = (signal) => {
        console.log(`${signal} received; shutting down`);
        server.close(() => {
            void mongoose_1.default.disconnect().finally(() => process.exit(0));
        });
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
});
startServer().catch((error) => {
    console.error('Application startup failed:', error);
    void mongoose_1.default.disconnect().finally(() => process.exit(1));
});
