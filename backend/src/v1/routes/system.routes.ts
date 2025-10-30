import { Router } from "express";
import {
  getSystemRoles,
  getICD10Codes,
  getDrugLibrary,
  getReferenceRanges,
  getAuditLogs,
} from "../../controllers/system.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/roles", getSystemRoles);

router.get("/icd10", authorize(["DOCTOR"]), getICD10Codes);

router.get("/drug-library", authorize(["DOCTOR"]), getDrugLibrary);

router.get(
  "/reference-ranges",
  authorize(["DOCTOR", "NURSE"]),
  getReferenceRanges
);

router.get("/audit-logs", authorize(["ADMIN"]), getAuditLogs);

export default router;
