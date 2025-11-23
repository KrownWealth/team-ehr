import { Router } from "express";
import {
  getDashboardStats,
  getGeneralDashboardStats,
} from "../../controllers/admin.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router = Router();

// Routes accessible by multiple roles (define BEFORE global admin authorization)
router.get(
  "/dashboard/stats",
  authenticate,
  tenantIsolation,
  authorize(["ADMIN", "CLERK", "NURSE", "DOCTOR", "CASHIER"]),
  getGeneralDashboardStats
);

// Apply authentication and tenant isolation to remaining routes
router.use(authenticate);
router.use(tenantIsolation);

// Apply admin-only authorization to remaining routes
router.use(authorize(["ADMIN"]));

router.get("/admin/dashboard/stats", getDashboardStats);

export default router;
