import { NextFunction, Request, Response } from "express";

// Added 'export' right here!
export const responseFormatter = (handler:Function) => {
    return async (req:Request, res:Response, next:NextFunction) =>{
        const result  = await handler(req,res,next)
        
        if(res.headersSent) return;

        return res.status(result?.meta?.statusCode || 200 ).json({
            success:true ,
            message: result.message || 'success',
            data: result.data || result,
            meta: result.meta || {}
        })
    }
};

