import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  getDiagnosisSuggestions,
  checkDrugAllergies,
  analyzeVitals,
} from "../../controllers/ai.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router: RouterType = Router();

router.use(authenticate);
router.use(tenantIsolation);

// AI Features
router.post("/diagnose", authorize(["DOCTOR"]), getDiagnosisSuggestions);
router.post("/check-allergies", authorize(["DOCTOR"]), checkDrugAllergies);
router.post("/analyze-vitals", authorize(["DOCTOR", "NURSE"]), analyzeVitals);

export default router;
