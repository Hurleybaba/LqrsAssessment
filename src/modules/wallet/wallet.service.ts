import db from "../../database/knex.js";
import crypto from "crypto";
import { WalletRepository } from "./wallet.repository.js";
import { TransactionRepository } from "../transaction/transaction.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { AppError } from "../../utils/AppError.js";

const walletRepo = new WalletRepository();
const transactionRepo = new TransactionRepository();
const userRepo = new UserRepository();

// Service layer for wallet operations and transactions
export class WalletService {
  // Add funds to user's wallet with transaction logging
  static async fundWallet(userId: string, amount: number) {
    if (amount <= 0) throw new AppError("Amount must be positive", 400);

    return db.transaction(async (trx) => {
      // Fetch wallet for consistent read within transaction
      const wallet = await walletRepo.findByUserId(userId, trx);
      if (!wallet) throw new AppError("Wallet not found", 404);

      await walletRepo.updateBalance(wallet.id, amount, trx);

      await transactionRepo.createTransaction(
        {
          id: crypto.randomUUID(),
          wallet_id: wallet.id,
          type: "FUND",
          amount: amount,
          reference: `REF-${Date.now()}`,
          status: "SUCCESS",
        },
        trx,
      );

      return { message: "Funded successfully", amount };
    });
  }

  // Transfer funds between two users with row-level locking to prevent race conditions
  static async transfer(
    senderId: string,
    receiverEmail: string,
    amount: number,
  ) {
    if (amount <= 0) throw new AppError("Invalid amount", 400);

    return db.transaction(async (trx) => {
      // Acquire lock on sender wallet and verify sufficient balance
      const senderWallet = await walletRepo.findByUserIdForUpdate(
        senderId,
        trx,
      );
      if (!senderWallet) throw new AppError("Sender wallet not found", 404);
      if (Number(senderWallet.balance) < Number(amount))
        throw new AppError("Insufficient funds", 400);

      // Find receiver by email
      const receiver = await userRepo.findByEmail(receiverEmail);
      if (!receiver) throw new AppError("Receiver not found", 404);

      // Acquire lock on receiver wallet and prevent self-transfers
      const receiverWallet = await walletRepo.findByUserIdForUpdate(
        receiver.id,
        trx,
      );
      if (!receiverWallet) throw new AppError("Receiver wallet not found", 404);
      if (senderWallet.id === receiverWallet.id)
        throw new AppError("Self-transfer denied", 400);

      // Execute debit and credit with transaction records
      // Update both wallet balances
      await walletRepo.updateBalance(senderWallet.id, -amount, trx);
      await walletRepo.updateBalance(receiverWallet.id, amount, trx);

      // Record transfer relationship
      await transactionRepo.createTransfer(
        {
          id: crypto.randomUUID(),
          sender_wallet_id: senderWallet.id,
          receiver_wallet_id: receiverWallet.id,
          amount,
        },
        trx,
      );

      // Record sender transaction (negative amount)
      await transactionRepo.createTransaction(
        {
          id: crypto.randomUUID(),
          wallet_id: senderWallet.id,
          type: "TRANSFER",
          amount: -amount, // Visual preference
          reference: `TRF-jb-${Date.now()}`,
          status: "SUCCESS",
        },
        trx,
      );

      // Record receiver transaction (positive amount)
      await transactionRepo.createTransaction(
        {
          id: crypto.randomUUID(),
          wallet_id: receiverWallet.id,
          type: "TRANSFER",
          amount: amount,
          reference: `TRF-rc-${Date.now()}`,
          status: "SUCCESS",
        },
        trx,
      );

      return { status: "success", amount };
    });
  }

  // Withdraw funds from user's wallet with balance validation
  static async withdraw(userId: string, amount: number) {
    if (amount <= 0) throw new AppError("Amount must be positive", 400);

    return db.transaction(async (trx) => {
      // Acquire lock on wallet and verify sufficient funds
      const wallet = await walletRepo.findByUserIdForUpdate(userId, trx);
      if (!wallet) throw new AppError("Wallet not found", 404);
      if (Number(wallet.balance) < Number(amount))
        throw new AppError("Insufficient funds", 400);

      await walletRepo.updateBalance(wallet.id, -amount, trx);

      await transactionRepo.createTransaction(
        {
          id: crypto.randomUUID(),
          wallet_id: wallet.id,
          type: "WITHDRAW",
          amount: -amount,
          reference: `WDR-${Date.now()}`,
          status: "SUCCESS",
        },
        trx,
      );

      return { message: "Withdrawal successful" };
    });
  }

  // Retrieve all transactions for user's wallet ordered by date
  static async getHistory(userId: string) {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError("Wallet not found", 404);
    return transactionRepo.getHistory(wallet.id);
  }

  // Retrieve current wallet balance and currency
  static async getBalance(userId: string) {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError("Wallet not found", 404);

    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }
}
