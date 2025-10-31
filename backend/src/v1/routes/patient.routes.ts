import dotenv from "dotenv";
import { Router } from "express";
import type { Router as RouterType } from "express";

dotenv.config();

const router: RouterType = Router();

import {
  validateNIN,
  registerPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  // updateEmergencyContact,
} from "../../controllers/patient.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import { patientValidator } from "../../validators/patient.validator";
import { upload } from "../../middleware/upload.middleware";

router.use(authenticate);
router.use(tenantIsolation);

router.post("/validate-nin", validateNIN);

router.post(
  "/register",
  authorize(["ADMIN", "CLERK"]),
  upload.single("photo"),
  patientValidator,
  validate,
  registerPatient
);
router.get("/", getAllPatients);
router.get("/:id", getPatientById);
router.put("/:id", authorize(["ADMIN", "CLERK"]), updatePatient);
//router.put('/:id/emergency-contact', authorize(['ADMIN', 'CLERK']), updateEmergencyContact);

export default router;
