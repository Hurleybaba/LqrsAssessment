import Joi from "joi";

// Request payload for wallet funding
export interface FundWalletDto {
  amount: number;
}

// Request payload for wallet transfers
export interface TransferDto {
  email: string;
  amount: number;
}

// Request payload for wallet withdrawals
export interface WithdrawDto {
  amount: number;
}

// Joi validation schema for fund wallet request
export const fundWalletSchema = Joi.object({
  amount: Joi.number().positive().greater(0).required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be positive",
  }),
});

// Joi validation schema for transfer request
export const transferSchema = Joi.object({
  email: Joi.string().email().required(),
  amount: Joi.number().positive().greater(0).required(),
});

// Joi validation schema for withdraw request
export const withdrawSchema = Joi.object({
  amount: Joi.number().positive().greater(0).required(),
});
