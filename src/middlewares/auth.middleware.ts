// [file] src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import db from "../database/knex.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const fauxAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  // FAUX AUTH: We expect the token to be the USER ID for simplicity
  const user = await db("users").where({ id: token }).first();

  if (!user) {
    return next(new AppError("The user belonging to this token no longer does exist.", 401));
  }

  req.user = { id: user.id, email: user.email };
  next();
};