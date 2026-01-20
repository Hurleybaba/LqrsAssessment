import db from "../../database/knex.js";
import crypto from "crypto";
import { WalletRepository } from "./wallet.repository.js";
import { TransactionRepository } from "../transaction/transaction.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { AppError } from "../../utils/AppError.js";

const walletRepo = new WalletRepository();
const transactionRepo = new TransactionRepository();
const userRepo = new UserRepository();

export class WalletService {
  static async fundWallet(userId: string, amount: number) {
    if (amount <= 0) throw new AppError("Amount must be positive", 400);

    return db.transaction(async (trx) => {
      // Locking isn't strictly necessary for funding (increment is atomic),
      // but consistent read is good.
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

  static async transfer(
    senderId: string,
    receiverEmail: string,
    amount: number,
  ) {
    if (amount <= 0) throw new AppError("Invalid amount", 400);

    return db.transaction(async (trx) => {
      // 1. Lock Sender
      const senderWallet = await walletRepo.findByUserIdForUpdate(
        senderId,
        trx,
      );
      if (!senderWallet) throw new AppError("Sender wallet not found", 404);
      if (Number(senderWallet.balance) < Number(amount))
        throw new AppError("Insufficient funds", 400);

      // 2. Validate Receiver
      const receiver = await userRepo.findByEmail(receiverEmail);
      if (!receiver) throw new AppError("Receiver not found", 404);

      // 3. Lock Receiver
      const receiverWallet = await walletRepo.findByUserIdForUpdate(
        receiver.id,
        trx,
      );
      if (!receiverWallet) throw new AppError("Receiver wallet not found", 404);
      if (senderWallet.id === receiverWallet.id)
        throw new AppError("Self-transfer denied", 400);

      // 4. Execution
      await walletRepo.updateBalance(senderWallet.id, -amount, trx);
      await walletRepo.updateBalance(receiverWallet.id, amount, trx);

      await transactionRepo.createTransfer(
        {
          id: crypto.randomUUID(),
          sender_wallet_id: senderWallet.id,
          receiver_wallet_id: receiverWallet.id,
          amount,
        },
        trx,
      );

      // Log for Sender
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

      // Log for Receiver
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

  static async withdraw(userId: string, amount: number) {
    if (amount <= 0) throw new AppError("Amount must be positive", 400);

    return db.transaction(async (trx) => {
      const wallet = await walletRepo.findByUserIdForUpdate(userId, trx);
      if (!wallet) throw new AppError("Wallet not found", 404);
      console.log(wallet.balance);
      console.log(amount);
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

  static async getHistory(userId: string) {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError("Wallet not found", 404);
    return transactionRepo.getHistory(wallet.id);
  }

  // Add inside WalletService class
  static async getBalance(userId: string) {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new AppError("Wallet not found", 404);

    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }
}
