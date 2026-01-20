import { Request, Response, NextFunction } from "express";
import { AuthService } from "./user.service.js";
import { AppError } from "../../utils/AppError.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = await AuthService.registerUser(req.body);
    res.status(201).json({
      status: "success",
      message: "Registered",
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get User ID from the request (set by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("You are not logged in", 401);
    }

    // 2. Fetch user data
    const user = await AuthService.getUser(userId);

    // 3. Return response
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
