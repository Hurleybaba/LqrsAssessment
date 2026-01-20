import { Knex } from "knex";
import db, { TransactionModel, Transfer } from "../../database/knex.js";

// Repository for transaction database operations
export class TransactionRepository {
  // Insert transaction record within a transaction context
  async createTransaction(
    data: Partial<TransactionModel>,
    trx: Knex.Transaction,
  ) {
    return trx("transactions").insert(data);
  }

  // Insert transfer relationship record within a transaction context
  async createTransfer(data: Partial<Transfer>, trx: Knex.Transaction) {
    return trx("transfers").insert(data);
  }

  // Retrieve transaction history for wallet ordered by creation date descending
  async getHistory(walletId: string) {
    return db("transactions")
      .where({ wallet_id: walletId })
      .orderBy("created_at", "desc");
  }
}
