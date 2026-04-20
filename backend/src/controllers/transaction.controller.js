import mongoose from "mongoose";
import {
  processTransaction,
  processSystemTransaction,
} from "../services/transaction.service.js";
import accountModel from "../models/account.model.js";
import ledgerModel from "../models/ledger.model.js";
import { z } from "zod";
import { LEDGER_TYPE } from "../utils/constants.js";

const createTransactionSchema = z.object({
  fromAccount: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid fromAccount"),
  toAccount: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid toAccount"),
  amount: z.number().positive("Amount must be greater than zero"),
  idempotencyKey: z.string().min(1, "idempotencyKey is required"),
  note: z.string().optional()
});

const initialFundsSchema = z.object({
  toAccount: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid toAccount"),
  amount: z.number().positive("Amount must be greater than zero"),
  idempotencyKey: z.string().min(1, "idempotencyKey is required"),
  note: z.string().optional()
});

async function createTransaction(req, res) {
  const validated = createTransactionSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      success: false,
      message: validated.error.issues[0].message,
    });
  }

  const { fromAccount, toAccount, amount, idempotencyKey, note } = validated.data;

  if (fromAccount === toAccount) {
    return res.status(400).json({
      success: false,
      message: "Cannot transfer to same account",
    });
  }

  try {
    const transaction = await processTransaction({
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      note,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Transaction processed",
      transaction,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function createInitialFundsTransaction(req, res) {
  const validated = initialFundsSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      success: false,
      message: validated.error.issues[0].message,
    });
  }

  const { toAccount, amount, idempotencyKey, note } = validated.data;

  try {
    const transaction = await processSystemTransaction({
      toAccount,
      amount,
      idempotencyKey,
      note,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Initial funds transaction processed",
      transaction,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getTransactionHistoryController(req, res) {
  try {
    const { accountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accountId",
      });
    }

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const transactions = await ledgerModel
      .find({ account: accountId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "transaction",
        select: "note amount status createdAt",
      })
      .lean();

    const formatted = transactions.map((tx) => ({
      ...tx,
      direction: tx.type === LEDGER_TYPE.DEBIT ? "OUT" : "IN",
    }));

    const total = await ledgerModel.countDocuments({ account: accountId });

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      transactions: formatted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export {
  createTransaction,
  createInitialFundsTransaction,
  getTransactionHistoryController,
};
