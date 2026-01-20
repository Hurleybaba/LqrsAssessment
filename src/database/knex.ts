import knex from "knex";
import { config } from "../config/knex.config.js";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: Date;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: Date;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: "FUND" | "TRANSFER" | "WITHDRAW";
  amount: number;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  created_at: Date;
}

export interface Transfer {
  id: string;
  sender_wallet_id: string;
  receiver_wallet_id: string;
  amount: number;
  created_at: Date;
}

declare module "knex" {
  namespace Knes {
    interface Tables {
      users: User;
      wallets: Wallet;
      transactions: Transaction;
      transfers: Transfer;
    }
  }
}

const db = knex(config);

export default db;
