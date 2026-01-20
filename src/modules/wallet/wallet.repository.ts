import { Knex } from "knex";
import db, { Wallet } from "../../database/knex.js";

// Repository for wallet database operations
export class WalletRepository {
  // Insert new wallet record
  async create(wallet: Partial<Wallet>, trx?: Knex.Transaction) {
    const query = trx ? trx("wallets") : db("wallets");
    return query.insert(wallet);
  }

  // Query wallet by user ID without locking
  async findByUserId(userId: string, trx?: Knex.Transaction) {
    const query = trx ? trx("wallets") : db("wallets");
    return query.where({ user_id: userId }).first();
  }

  // Query wallet with row lock for update operations in transactions
  async findByUserIdForUpdate(userId: string, trx: Knex.Transaction) {
    return trx("wallets").where({ user_id: userId }).forUpdate().first();
  }

  // Atomically increment or decrement wallet balance
  async updateBalance(walletId: string, amount: number, trx: Knex.Transaction) {
    return trx("wallets").where({ id: walletId }).increment("balance", amount);
  }
}
