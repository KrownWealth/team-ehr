import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import logger from "../utils/logger.utils";

export const tenantIsolation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // ✅ Allow admins with "pending" clinic to access onboarding endpoint
  if (req.user?.role === "ADMIN" && req.clinicId === "pending") {
    // Check if this is the onboarding endpoint
    if (req.path.includes("/onboard") || req.path.includes("/clinic/onboard")) {
      logger.debug(`Admin onboarding access allowed for: ${req.user.email}`);
      return next();
    }
  }

  // ✅ Require valid clinicId for all other requests
  if (!req.clinicId || req.clinicId === "pending") {
    logger.error("Tenant isolation failed: No valid clinicId found");
    return res.status(400).json({
      status: "error",
      message: "Please complete clinic onboarding first",
    });
  }

  logger.debug(`Tenant isolation applied: ${req.clinicId}`);
  next();
};
