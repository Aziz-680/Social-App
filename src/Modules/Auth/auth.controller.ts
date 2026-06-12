import { Router } from "express";
import authService from "./auth.service";
const authController = Router()

authController.get('/health', (req,res,next)=>{
    const result = authService.health(req.body)
    res.status(200).json({ message:'done',result})
})

export default authController