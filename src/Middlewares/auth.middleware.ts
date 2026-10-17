// import { Request, Response, NextFunction } from "express";
// import TokenService from "../Common/Services/token.service";
// import { UnauthorizedException } from "../Common/Utils/Errors/exceptions";
// import UserModel from "../DB/Models/user.model";
// export interface ISecureRequest extends Request {
//   user?: any;
//   decodedData?: any;
// }

// export const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     let token = "";

//     // 1. First, try to extract the token from the HttpOnly cookie
//     if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     } 
//     // 2. Fallback: Check if the header exists and follows the "Bearer <token>" format
//     else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     // 3. If no token was found in either location, deny access
//     if (!token) {
//       throw new UnauthorizedException("Access denied. No token provided.");
//     }

//     // 4. Decode and verify the token using your TokenService
//     const decodedPayload = await TokenService.decodeToken({
//       token,
//       tokenType: "ACCESS",
//     });

//     // 5. Attach the decoded payload to the request object
//     const authenticatedRequest = req as ISecureRequest;
//     authenticatedRequest.user = decodedPayload.user;
//     authenticatedRequest.decodedData = decodedPayload.decodedData;

//     next();
//   } catch (error: any) {
//     if (error instanceof UnauthorizedException) {
//       return next(error);
//     }

//     next(new UnauthorizedException("Invalid or expired token"));
//   }
// };


import { Request, Response, NextFunction } from "express";
import TokenService from "../Common/Services/token.service";
import { UnauthorizedException } from "../Common/Utils/Errors/exceptions";
import UserModel from "../DB/Models/user.model"; // Add this import

export interface ISecureRequest extends Request {
  user?: any;
  decodedData?: any;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = "";

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedException("Access denied. No token provided.");
    }

    const decodedPayload = await TokenService.decodeToken({
      token,
      tokenType: "ACCESS",
    });

    // Extract the ID (Depends on how TokenService nests the payload)
    const userId =  decodedPayload.user?._id;

    // Fetch fresh user data, exclude password, and populate friends
    const currentUser = await UserModel.findById(userId)
      .select('-password') // This strictly prevents the password from being returned
      .populate('friends', 'firstName lastName profilePicture'); // Fetches friend details

    if (!currentUser) {
      throw new UnauthorizedException("User no longer exists.");
    }

    const authenticatedRequest = req as ISecureRequest;
    authenticatedRequest.user = currentUser; 
    authenticatedRequest.decodedData = decodedPayload.decodedData || decodedPayload;

    next();
  } catch (error: any) {
    if (error instanceof UnauthorizedException) {
      return next(error);
    }
    next(new UnauthorizedException("Invalid or expired token"));
  }
};