import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  updateProfile,
  getDashboardStats,
} from "../../controllers/admin.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router: RouterType = Router();

router.use(authenticate);

router.use(tenantIsolation);
router.use(authorize(["ADMIN"]));

router.put("/profile", updateProfile);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

export default router;
