import { Router } from "express";
import type { Router as RouterType } from "express";

import {
  createConsultation,
  getConsultationById,
  updateConsultation,
  getPatientConsultations,
} from "../../controllers/consultation.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import { consultationValidator } from "../../validators/consultation.validator";

const router: RouterType = Router();

router.use(authenticate);
router.use(tenantIsolation);

// Consultation Management
router.post(
  "/",
  authorize(["DOCTOR"]),
  consultationValidator,
  validate,
  createConsultation
);
router.get("/:id", getConsultationById);
router.put("/:id", authorize(["DOCTOR"]), updateConsultation);
router.get("/patient/:patientId", getPatientConsultations);

export default router;
