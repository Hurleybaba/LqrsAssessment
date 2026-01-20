import { Knex } from "knex";
import db, { Transaction, Transfer } from "../../database/knex.js";

export class TransactionRepository {
  async createTransaction(data: Partial<Transaction>, trx: Knex.Transaction) {
    return trx("transactions").insert(data);
  }

  async createTransfer(data: Partial<Transfer>, trx: Knex.Transaction) {
    return trx("transfers").insert(data);
  }

  async getHistory(walletId: string) {
    return db("transactions")
      .where({ wallet_id: walletId })
      .orderBy("created_at", "desc");
  }
}