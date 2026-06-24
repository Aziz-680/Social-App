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



// Option 1: Data Population. Right now, your timeline just shows a random MongoDB userId (like 65f1a2b...). We can use Mongoose's .populate() to automatically replace that ID with the author's actual firstName, lastName, and profilePicture so the frontend can display it beautifully.

// Option 2: The Like System. We can build a PUT /api/post/:id/like route that lets a user like (or unlike) a post, pushing their User ID into the post's likes array.

// Option 3: Authorization (Deletion Rights). We can build the DELETE routes, but we have to write special logic so a user can only delete their own posts, not someone else's!