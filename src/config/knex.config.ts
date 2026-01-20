import { Knex } from "knex";
import { env } from "./env.js";

// Database connection configuration for Knex ORM
export const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    port: env.DB_PORT,
    multipleStatements: true,
    timezone: "Z",
  },
  // Connection pool configuration
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: "./src/database/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/database/seeds",
    extension: "ts",
  },
};
