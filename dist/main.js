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
// Part 1: What Next? (The Advanced Features)
// While the core app is done, real social media apps usually have a few extra layers of polish. Here are the three most popular features you could build next to make your API truly elite:
// Option A: Pagination (Crucial for scaling). Right now, GET /api/post fetches every single post in the database. If your app gets 10,000 posts, your server will crash trying to send them all at once! We can add Pagination (e.g., ?page=1&limit=10) so it only sends 10 posts at a time.
// Option B: The Follow System. We can build a feature where Users can Follow/Unfollow each other, and then create a new GET /api/post/feed route that only shows posts from people you follow, instead of a global timeline.
// Option C: Real File Uploads. Right now, your users are just pasting image URLs. We could integrate Multer and a cloud storage service like Cloudinary so users can actually upload image files straight from their phones/computers.
// Part 2: When should we deploy?
// You can deploy right now. In modern software development, we practice something called "Continuous Deployment." You don't have to wait until every single feature is finished to put it online! Deploying now means you (or your frontend developer) can start building the mobile app or website using a live URL instead of localhost.
// However, before we push this to a live server (like Render, Railway, or Heroku), we need to do a Pre-Flight Security Check.
// If we deploy today, we need to ensure these three things are done:
// MongoDB Atlas: Your local mongodb://localhost:27017 won't work on the internet. We need to set up a free cloud database on MongoDB Atlas.
// CORS (Cross-Origin Resource Sharing): We need to tell your Express server which frontend websites are safely allowed to talk to it.
// Environment Variables: Ensuring your JWT Secret and Database passwords are safely hidden in a .env file and not hardcoded in your code.
