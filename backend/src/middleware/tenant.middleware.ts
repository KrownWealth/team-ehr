import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import logger from "../utils/logger.utils";

export const tenantIsolation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.clinicId) {
    logger.error("Tenant isolation failed: No clinicId found");
    return res.status(400).json({
      status: "error",
      message: "Clinic context not found",
    });
  }

  logger.debug(`Tenant isolation applied: ${req.clinicId}`);
  next();
};
