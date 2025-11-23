import { Router } from "express";
import { getGeneralDashboardStats } from "../../controllers/admin.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router = Router();

// Routes accessible by multiple roles (define BEFORE global admin authorization)
router.get(
  "/stats",
  authenticate,
  tenantIsolation,
  authorize(["ADMIN", "CLERK", "NURSE", "DOCTOR", "CASHIER"]),
  getGeneralDashboardStats
);

export default router;
