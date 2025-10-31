import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
  updatePrescription,
  checkAllergies,
} from "../../controllers/prescription.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  checkAllergiesValidator,
  createPrescriptionValidator,
  updatePrescriptionValidator,
} from "../../validators/prescription.validator";

const router: RouterType = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.post(
  "/create",
  authorize(["DOCTOR"]),
  createPrescriptionValidator,
  validate,
  createPrescription
);

router.get("/patient/:patientId", getPatientPrescriptions);

router.get("/:id", getPrescriptionById);

router.patch(
  "/:id",
  authorize(["DOCTOR"]),
  updatePrescriptionValidator,
  validate,
  updatePrescription
);

router.post(
  "/check-allergies",
  authorize(["DOCTOR"]),
  checkAllergiesValidator,
  validate,
  checkAllergies
);

export default router;
