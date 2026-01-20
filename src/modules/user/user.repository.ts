import { Knex } from "knex";
import db, { User } from "../../database/knex.js";

// Repository for user database operations
export class UserRepository {
  // Insert new user record, optionally within a transaction
  async create(user: Partial<User>, trx?: Knex.Transaction) {
    const query = trx ? trx("users") : db("users");
    return query.insert(user);
  }

  // Query user by email address
  async findByEmail(email: string) {
    return db("users").where({ email }).first();
  }

  // Query user by ID
  async findById(id: string) {
    return db("users").where({ id }).first();
  }
}
