import { Request, Response, NextFunction } from "express";
import { AuthService } from "./user.service.js";
import { AppError } from "../../utils/AppError.js";

// User registration request data structure
interface RegisterUserDto {
  email: string;
  first_name: string;
  last_name: string;
}

// Register new user with email and basic info, create wallet, and return user ID as token
export const register = async (
  req: Request<{}, {}, RegisterUserDto>,
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

// Retrieve authenticated user's profile information and wallet details
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("You are not logged in", 401);
    }

    const user = await AuthService.getUser(userId);

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
