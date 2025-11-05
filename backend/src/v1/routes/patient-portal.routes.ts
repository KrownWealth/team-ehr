import { Router } from "express";
import {
  getPatientDashboard,
  recordSelfVitals,
  getMedicationReminders,
  requestAppointment,
  getMyMedicalRecords,
  getPersonalizedHealthTips,
} from "../../controllers/patient-portal.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { body } from "express-validator";

const router = Router();

router.use(authenticate);
router.use(authorize(["PATIENT"]));

router.get("/dashboard", getPatientDashboard);

router.post(
  "/vitals/record",
  [
    body("bloodPressure").optional().isString(),
    body("temperature").optional().isFloat({ min: 30, max: 45 }),
    body("pulse").optional().isInt({ min: 30, max: 200 }),
    body("weight").optional().isFloat({ min: 0 }),
    body("bloodGlucose").optional().isFloat({ min: 0 }),
  ],
  validate,
  recordSelfVitals
);

// Medication Management
router.get("/medications/reminders", getMedicationReminders);

// Appointments
router.post(
  "/appointments/request",
  [
    body("preferredDate").isISO8601().withMessage("Valid date required"),
    body("reason").notEmpty().withMessage("Reason is required"),
  ],
  validate,
  requestAppointment
);

// Medical Records
router.get("/medical-records", getMyMedicalRecords);

// Health Education
router.get("/health-tips", getPersonalizedHealthTips);

export default router;
