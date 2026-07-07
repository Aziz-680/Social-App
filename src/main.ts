import express, { Application, NextFunction, Request, Response } from 'express'
import { envConfig } from './config'
import { authController, commentController, postController, userController } from './Modules'
import { dbConnection } from './DB/db.connection.js'

const app: Application = express()



// function to handle all project controllers
function initializeControllers(app: Application) {
    //project controllers
    app.use('/api/auth', authController)
    app.use('/api/user', userController)
    app.use('/api/post', postController)
    app.use('/api/comment', commentController)


    // Health check route
    app.get('/', (_req: express.Request, res: express.Response) => {
        res.json({ message: "Welcome to the Express + TypeScript Server!" });
    });

    // 404 handler
    app.use((_req: express.Request, res: express.Response) => {
        res.status(404).json({ message: "Route not found" });
    });

}

// function to handle all common middlewares
function initializeCommonMiddlewares(app: Application) {
    app.use(express.json())
}


initializeCommonMiddlewares(app)
initializeControllers(app)

// DataBase Connection
dbConnection()

const port: number | string = envConfig.app.port
app.listen(port, () => {
    console.log('Server is running on port', port)
})



// Part 1: What Next? (The Advanced Features)
// While the core app is done, real social media apps usually have a few extra layers of polish. Here are the three most popular features you could build next to make your API truly elite:

// Option A: Pagination (Crucial for scaling). Right now, GET /api/post fetches every single post in the database. If your app gets 10,000 posts, your server will crash trying to send them all at once! We can add Pagination (e.g., ?page=1&limit=10) so it only sends 10 posts at a time.

// Option B: The Follow System. We can build a feature where Users can Follow/Unfollow each other, and then create a new GET /api/post/feed route that only shows posts from people you follow, instead of a global timeline.

// Option C: Real File Uploads. Right now, your users are just pasting image URLs. We could integrate Multer and a cloud storage service like Cloudinary so users can actually upload image files straight from their phones/computers.
// npm install multer cloudinary multer-storage-cloudinary
// npm install @types/multer --save-dev

// Part 2: When should we deploy?
// You can deploy right now. In modern software development, we practice something called "Continuous Deployment." You don't have to wait until every single feature is finished to put it online! Deploying now means you (or your frontend developer) can start building the mobile app or website using a live URL instead of localhost.

// However, before we push this to a live server (like Render, Railway, or Heroku), we need to do a Pre-Flight Security Check.

// If we deploy today, we need to ensure these three things are done:

// MongoDB Atlas: Your local mongodb://localhost:27017 won't work on the internet. We need to set up a free cloud database on MongoDB Atlas.

// CORS (Cross-Origin Resource Sharing): We need to tell your Express server which frontend websites are safely allowed to talk to it.

// Environment Variables: Ensuring your JWT Secret and Database passwords are safely hidden in a .env file and not hardcoded in your code.