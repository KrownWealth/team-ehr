import { Router } from "express";
import {
  createConsultation,
  getConsultationById,
  updateConsultation,
  getPatientConsultations,
  getAllConsultations,
} from "../../controllers/consultation.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import { consultationValidator } from "../../validators/consultation.validator";

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.get("/", getAllConsultations);

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
