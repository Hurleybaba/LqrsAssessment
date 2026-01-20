import { config } from "dotenv";

config();

// Configuration interface for all environment variables
interface Config {
  PORT: number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  DB_PORT: number;
  ADJUTOR_API_KEY: string;
  NODE_ENV: "development" | "production" | "test";
}

// Retrieve and validate environment variable, throw error if missing
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Retrieve environment variable and safely parse as integer
const getEnvNumber = (key: string, defaultValue?: string): number => {
  const value = getEnv(key, defaultValue);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

export const env = {
  PORT: getEnvNumber("PORT", "3000"),

  DB_HOST: getEnv("DB_HOST"),
  DB_USER: getEnv("DB_USER"),
  DB_PASS: getEnv("DB_PASS"),
  DB_NAME: getEnv("DB_NAME"),
  DB_PORT: getEnvNumber("DB_PORT", "3306"),

  ADJUTOR_API_KEY: getEnv("ADJUTOR_API_KEY"),

  NODE_ENV: getEnv("NODE_ENV", "development") as
    | "development"
    | "production"
    | "test",
};
