import { ROLES } from "../utils/constants.js";

export function adminMiddleware(req, res, next) {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin only",
    });
  }

  next();
}
