import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  getRevenueReport,
  getPatientStats,
  getConsultationMetrics,
  exportReport,
  getAppointmentStats,
} from "../../controllers/report.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router: RouterType = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.get("/revenue", authorize(["ADMIN", "CASHIER"]), getRevenueReport);

router.get("/patient-stats", authorize(["ADMIN", "DOCTOR"]), getPatientStats);

router.get(
  "/consultation-metrics",
  authorize(["ADMIN", "DOCTOR"]),
  getConsultationMetrics
);

router.get(
  "/appointment-stats",
  authorize(["ADMIN", "CLERK"]),
  getAppointmentStats
);

router.get("/export", authorize(["ADMIN"]), exportReport);

export default router;
