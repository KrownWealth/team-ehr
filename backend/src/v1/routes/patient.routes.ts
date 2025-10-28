import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

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

// NIN Validation
router.post("/validate-nin", validateNIN);

// Patient Management
router.post(
  "/",
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
