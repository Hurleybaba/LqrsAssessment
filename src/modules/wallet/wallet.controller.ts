import { Request, Response, NextFunction } from "express";
import { WalletService } from "./wallet.service.js";
import { AppError } from "../../utils/AppError.js";
import {
  FundWalletDto,
  TransferDto,
  WithdrawDto,
} from "./wallet.validation.js";

// Extract and validate authenticated user ID from request
const getUserId = (req: Request): string => {
  if (!req.user || !req.user.id) {
    throw new AppError("User not authenticated", 401);
  }
  return req.user.id;
};

// Add funds to user's wallet
export const fund = async (
  req: Request<{}, {}, FundWalletDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.fundWallet(userId, req.body.amount);
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

// Transfer funds from user's wallet to another user's wallet
export const transfer = async (
  req: Request<{}, {}, TransferDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.transfer(
      userId,
      req.body.email,
      req.body.amount,
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

// Withdraw funds from user's wallet
export const withdraw = async (
  req: Request<{}, {}, WithdrawDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.withdraw(userId, req.body.amount);
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

// Retrieve transaction history for user's wallet
export const history = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.getHistory(userId);
    res
      .status(200)
      .json({ status: "success", results: result.length, data: result });
  } catch (e) {
    next(e);
  }
};

// Retrieve current wallet balance and currency
export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.getBalance(userId);
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};
