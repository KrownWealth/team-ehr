import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  recordVitals,
  getPatientVitals,
  updateVitals,
  getAbnormalFlags,
} from "../../controllers/vital.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import { vitalsValidator } from "../../validators/vitals.validator";

const router: RouterType = Router();

router.use(authenticate);
router.use(tenantIsolation);

// Vitals Management
router.post(
  "/",
  authorize(["NURSE", "DOCTOR"]),
  vitalsValidator,
  validate,
  recordVitals
);
router.get("/patient/:patientId", getPatientVitals);
router.put("/:id", authorize(["NURSE", "DOCTOR"]), updateVitals);
router.get("/:id/flags", getAbnormalFlags);

export default router;
