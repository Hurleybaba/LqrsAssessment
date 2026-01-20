// [file] src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import db from "../database/knex.js";

// Authenticate user by extracting Bearer token and verifying user exists in database
export const fauxAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  // Extract token from Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }

  // Faux auth: treat token as user ID and fetch user record
  const user = await db("users").where({ id: token }).first();

  if (!user) {
    return next(
      new AppError(
        "The user belonging to this token no longer does exist.",
        401,
      ),
    );
  }

  req.user = { id: user.id, email: user.email };
  next();
};
