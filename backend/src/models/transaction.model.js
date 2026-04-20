import mongoose from "mongoose";
import { TRANSACTION_STATUS } from "../utils/constants.js";

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TRANSACTION_STATUS),
        message: "Invalid status",
      },
      default: TRANSACTION_STATUS.INITIATED,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    failureReason: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Transaction amount must be greater than 0"],
    },
    idempotencyKey: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// prevent self-transfer
transactionSchema.pre("validate", function () {
  if (this.fromAccount.equals(this.toAccount)) {
    throw new Error("Cannot transfer to same account");
  }
});

// indexes
transactionSchema.index({ fromAccount: 1 });
transactionSchema.index({ toAccount: 1 });
transactionSchema.index({ fromAccount: 1, status: 1 });
transactionSchema.index(
  { idempotencyKey: 1, fromAccount: 1 },
  { unique: true },
);

const transactionModel = mongoose.model("transaction", transactionSchema);

export default transactionModel;
