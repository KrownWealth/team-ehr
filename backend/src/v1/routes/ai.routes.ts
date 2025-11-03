import { Router } from "express";
import { getDiagnosisSuggestions } from "../../controllers/ai.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

// AI Features
router.post("/diagnose", authorize(["DOCTOR"]), getDiagnosisSuggestions);
// router.post("/check-allergies", authorize(["DOCTOR"]), checkDrugAllergies);
// router.post("/analyze-vitals", authorize(["DOCTOR", "NURSE"]), analyzeVitals);

export default router;
