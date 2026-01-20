import express, { Express, Request, Response, NextFunction } from "express";
import { globalErrorHandler } from "./middlewares/error.js";
import { AppError } from "./utils/AppError.js";
import routes from "./routes.js";

const app: Express = express();

app.use(express.json());

//Routes
app.use(routes);

// 404 handler
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Global Error Hander
app.use(globalErrorHandler);

export default app;
