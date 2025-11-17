import { Router } from "express";
import {
  getDiagnosisSuggestions,
  checkDrugInteractions,
  analyzeVitalsTrends,
  assessPatientRisk,
} from "../../controllers/ai.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

// AI Clinical Decision Support
router.post("/diagnose", authorize(["DOCTOR"]), getDiagnosisSuggestions);
router.post("/drug-interactions", authorize(["DOCTOR"]), checkDrugInteractions);
router.get(
  "/vitals-trends/:patientId",
  authorize(["DOCTOR", "NURSE"]),
  analyzeVitalsTrends
);
router.get(
  "/risk-assessment/:patientId",
  authorize(["DOCTOR"]),
  assessPatientRisk
);

export default router;
