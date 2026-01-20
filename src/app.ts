import express, { Express, Request, Response, NextFunction } from "express";
import { globalErrorHandler } from "./middlewares/error.js";
import { AppError } from "./utils/AppError.js";
import routes from "./routes.js";

// Initialize Express application instance
const app: Express = express();

app.use(express.json());

// Mount API routes
app.use(routes);

// Catch-all handler for undefined routes and return 404 error
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized global error handler middleware
app.use(globalErrorHandler);

export default app;
