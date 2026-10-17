import {
  authenticate,
  ISecureRequest,
} from "../../Middlewares/auth.middleware";
import { Router, Request, Response, NextFunction } from "express";
import authService from "./auth.service";
import { responseFormatter } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { RegisterSchema, LoginSchema } from "../../Validators/auth.validators";
import { RegisterBodyType, LoginBodyType } from "../../Common/Types";
import UserModel from "../../DB/Models/user.model";

const authController = Router();

authController.get(
  "/me",
  authenticate,
  responseFormatter(async (req: Request, res: Response) => {
    const secureReq = req as ISecureRequest;

    return {
      message: "Session is valid",
      data: {
        user: secureReq.user,
        decodedData: secureReq.decodedData,
      },
      meta: { statusCode: 200 },
    };
  })
);

authController.post(
  "/register",
  validation(RegisterSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body as RegisterBodyType);

    return {
      message: "User registered successfully",
      data: result,
      meta: { statusCode: 201 },
    };
  })
);

authController.post(
  "/login",
  validation(LoginSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body as LoginBodyType);
    const { user, tokens } = result as any;

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: "User logged in successfully",
      data: { user },
      meta: { statusCode: 200 },
    };
  })
);

authController.post(
  "/google",
  responseFormatter(async (req: Request, res: Response) => {
    const { googleToken } = req.body;

    if (!googleToken) {
      res.status(400);
      throw new Error("Google token is required");
    }

    const result = await authService.googleLogin(googleToken);
    const { user, tokens } = result as any;

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: "Google login successful",
      data: { user },
      meta: { statusCode: 200 },
    };
  })
);

// Unified Single Logout Route
authController.post(
  "/logout",
  authenticate,
  responseFormatter(async (req: Request, res: Response) => {
    const secureReq = req as ISecureRequest;

    if (secureReq.user?._id) {
      await UserModel.findByIdAndUpdate(secureReq.user._id, {
        status: "offline",
      });
    }

    res.clearCookie("token");

    return {
      message: "Logged out successfully",
      data: null,
      meta: { statusCode: 200 },
    };
  })
);

export default authController;