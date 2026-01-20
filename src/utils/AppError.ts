// Custom error class for operational/expected application errors
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Mark as operational error that should be handled gracefully
    this.isOperational = true;

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}
