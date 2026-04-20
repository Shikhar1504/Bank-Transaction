import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import {
  freezeAccount,
  unfreezeAccount,
  getAllUsers,
  getAllTransactions,
  getAdminStats,
} from "../controllers/admin.controller.js";
import { strictLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// ✅ apply both middlewares
router.use(strictLimiter, authMiddleware, adminMiddleware);

router.patch("/freeze/:accountId", freezeAccount);
router.patch("/unfreeze/:accountId", unfreezeAccount);
router.get("/users", getAllUsers);
router.get("/transactions", getAllTransactions);
router.get("/stats", getAdminStats);

export default router;
