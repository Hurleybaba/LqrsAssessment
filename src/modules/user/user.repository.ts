import { Knex } from "knex";
import db, { User } from "../../database/knex.js";

export class UserRepository {
  async create(user: Partial<User>, trx?: Knex.Transaction) {
    const query = trx ? trx("users") : db("users");
    return query.insert(user);
  }

  async findByEmail(email: string) {
    return db("users").where({ email }).first();
  }

  async findById(id: string) {
    return db("users").where({ id }).first();
  }
}