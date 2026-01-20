import { Knex } from "knex";
import db, { Wallet } from "../../database/knex.js";

export class WalletRepository {
  async create(wallet: Partial<Wallet>, trx?: Knex.Transaction) {
    const query = trx ? trx("wallets") : db("wallets");
    return query.insert(wallet);
  }

  async findByUserId(userId: string, trx?: Knex.Transaction) {
    const query = trx ? trx("wallets") : db("wallets");
    return query.where({ user_id: userId }).first();
  }

  async findByUserIdForUpdate(userId: string, trx: Knex.Transaction) {
    return trx("wallets").where({ user_id: userId }).forUpdate().first();
  }

  async updateBalance(walletId: string, amount: number, trx: Knex.Transaction) {
    // Determine strict increment/decrement based on logic, or just pass the signed amount
    return trx("wallets").where({ id: walletId }).increment("balance", amount);
  }
}
