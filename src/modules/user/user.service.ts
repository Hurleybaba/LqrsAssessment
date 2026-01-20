import db from "../../database/knex.js";
import crypto from "crypto";
import { UserRepository } from "./user.repository.js";
import { WalletRepository } from "../wallet/wallet.repository.js";
import { AdjutorService } from "./adjutor.service.js";
import { AppError } from "../../utils/AppError.js";

const userRepo = new UserRepository();
const walletRepo = new WalletRepository();

// Service layer for user authentication operations
export class AuthService {
  // Register new user: check blacklist, create user and wallet in atomic transaction
  static async registerUser(data: {
    email: string;
    first_name: string;
    last_name: string;
  }) {
    // Verify user doesn't already exist
    const existing = await userRepo.findByEmail(data.email);
    if (existing) throw new AppError("User already exists", 400);

    // Check if email is blacklisted via Adjutor service
    const isBlacklisted = await AdjutorService.isBlacklisted(data.email);
    if (isBlacklisted) throw new AppError("User is blacklisted", 403);

    // Create user and wallet in single atomic transaction
    return db.transaction(async (trx) => {
      const userId = crypto.randomUUID();

      await userRepo.create(
        {
          id: userId,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        },
        trx,
      );

      await walletRepo.create(
        {
          id: crypto.randomUUID(),
          user_id: userId,
          balance: 0.0,
          currency: "NGN",
        },
        trx,
      );

      return userId; // Return user ID as faux authentication token
    });
  }

  // Retrieve user profile with associated wallet information
  static async getUser(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const wallet = await walletRepo.findByUserId(userId);

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at,
      wallet: wallet
        ? {
            id: wallet.id,
            balance: wallet.balance,
            currency: wallet.currency,
          }
        : null,
    };
  }
}
