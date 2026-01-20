import { Request, Response, NextFunction } from "express";
import { WalletService } from "./wallet.service.js";

export const fund = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WalletService.fundWallet(
      req.user!.id,
      Number(req.body.amount),
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

export const transfer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await WalletService.transfer(
      req.user!.id,
      req.body.email,
      Number(req.body.amount),
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

export const withdraw = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await WalletService.withdraw(
      req.user!.id,
      Number(req.body.amount),
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

export const history = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await WalletService.getHistory(req.user!.id);
    res
      .status(200)
      .json({ status: "success", results: result.length, data: result });
  } catch (e) {
    next(e);
  }
};

// Add this export
export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WalletService.getBalance(req.user!.id);
    res.status(200).json({ status: "success", data: result });
  } catch (e) { next(e); }
};
