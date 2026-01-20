import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { env } from "../config/env.js";

// Centralized error handler that normalizes and returns appropriate HTTP responses
export const globalErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Initialize default error response values
  let statusCode = 500;
  let message = "An unexpected error occurred";
  let stack: string | undefined = undefined;

  if (error instanceof AppError) {
    // Handle operational/expected errors (validation, business logic)
    statusCode = error.statusCode;
    message = error.message;
    stack = error.stack;
  } else if (error instanceof Error) {
    // Handle unexpected programming errors
    logger.error("CRITICAL ERROR 💥:", error);

    // Hide error details in production for security
    if (env.NODE_ENV === "production") {
      message = "Something went wrong. Please try again later.";
    } else {
      message = error.message;
      stack = error.stack;
    }
  } else {
    // Handle non-Error thrown values (rare edge case)
    logger.error("CRITICAL ERROR 💥:", error);
    message = "Unknown error occurred";
  }

  res.status(statusCode).json({
    status: statusCode.toString().startsWith("4") ? "fail" : "error",
    message,
    stack: env.NODE_ENV === "development" ? stack : undefined,
  });
};
