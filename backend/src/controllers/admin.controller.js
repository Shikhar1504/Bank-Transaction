import accountModel from "../models/account.model.js";
import userModel from "../models/user.model.js";
import transactionModel from "../models/transaction.model.js";
import mongoose from "mongoose";

export async function freezeAccount(req, res) {
  const { accountId } = req.params;

  try {
    const account = await accountModel.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (account.status === "FROZEN") {
      return res.status(400).json({
        success: false,
        message: "Account already frozen",
      });
    }

    if (account.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Cannot freeze closed account",
      });
    }

    account.status = "FROZEN";
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Account frozen successfully",
      account,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function unfreezeAccount(req, res) {
  const { accountId } = req.params;

  try {
    const account = await accountModel.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (account.status !== "FROZEN") {
      return res.status(400).json({
        success: false,
        message: "Account is not frozen",
      });
    }

    account.status = "ACTIVE";
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Account unfrozen successfully",
      account,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getAllUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const users = await userModel
      .find()
      .select("email name createdAt")
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = users.map((user) => user._id);
    const accounts = await accountModel
      .find({ user: { $in: userIds } })
      .select("_id user status")
      .lean();

    const accountByUserId = new Map(
      accounts.map((account) => [String(account.user), account]),
    );

    const usersWithAccount = users.map((user) => {
      const account = accountByUserId.get(String(user._id));

      return {
        ...user,
        id: user._id,
        account: account
          ? {
              id: account._id,
              status: account.status,
            }
          : null,
      };
    });

    const total = await userModel.countDocuments();

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      users: usersWithAccount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getAllTransactions(req, res) {
  try {
    const { status, accountId } = req.query;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};

    // ✅ validate status
    const validStatuses = ["INITIATED", "PROCESSING", "COMPLETED", "FAILED"];
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }
      filter.status = status;
    }

    if (accountId && !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accountId",
      });
    }

    // ✅ filter by account (better naming than userId)
    if (accountId) {
      filter.$or = [{ fromAccount: accountId }, { toAccount: accountId }];
    }

    const transactions = await transactionModel
      .find(filter)
      .select("-__v -idempotencyKey")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // 🔥 populate for better API
      .populate("fromAccount", "_id balance")
      .populate("toAccount", "_id balance")
      .lean();

    const total = await transactionModel.countDocuments(filter);

    const formatted = transactions.map((tx) => ({
      ...tx,
      direction: tx.status === "FAILED" ? "FAILED" : "SUCCESS",
      displayAmount: `₹${tx.amount}`,
    }));

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      hasNextPage: page * limit < total, // 🔥 high-value addition
      transactions: formatted,
    });
  } catch (error) {
    console.error(error); // 🔥 always log
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getAdminStats(req, res) {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalTransactions = await transactionModel.countDocuments();
    const failedTransactions = await transactionModel.countDocuments({
      status: "FAILED",
    });

    const volume = await transactionModel.aggregate([
      {
        $match: { status: "COMPLETED" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        failedTransactions,
        totalVolume: volume[0]?.total || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
