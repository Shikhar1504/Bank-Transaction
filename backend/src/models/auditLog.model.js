import mongoose from "mongoose";
import { AUDIT_STATUS } from "../utils/constants.js";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AUDIT_STATUS),
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const auditLogModel = mongoose.model("auditLog", auditLogSchema);

export default auditLogModel;
