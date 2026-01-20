import winston from "winston";

// Define custom log level hierarchy
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine log level based on environment (verbose in dev, minimal in prod)
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Format logs for development environment with colors and timestamps
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Format logs for production as JSON for integration with log aggregation services
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: level(),
  levels,
  format: process.env.NODE_ENV === "development" ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    // In a real large-scale app, you might also log to a file or external service here
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

export default logger;
