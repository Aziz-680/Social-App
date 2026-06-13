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



// start vid 6 week 2