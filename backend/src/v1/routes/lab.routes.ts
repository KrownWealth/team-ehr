import { Router } from "express";
import {
  createLabOrder,
  getAllLabOrders,
  getLabOrderById,
  updateLabOrderStatus,
  uploadLabResult,
  getPatientLabHistory,
  getLabTestCatalog,
} from "../../controllers/lab.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { upload } from "../../middleware/upload.middleware";
import { idempotencyCheck } from "../../middleware/idempotency.middleware";

const router = Router();
// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

/**
 * POST /api/v1/labs/orders
 * Create a new lab order
 * Requires: DOCTOR
 */
router.post(
  "/orders",
  authorize(["DOCTOR"]),
  idempotencyCheck({ required: true }),
  createLabOrder
);

router.get("/orders", getAllLabOrders);

router.get("/orders/:id", getLabOrderById);

router.patch(
  "/orders/:id/status",
  authorize(["ADMIN", "DOCTOR", "NURSE"]),
  updateLabOrderStatus
);

router.post(
  "/orders/:id/result",
  authorize(["ADMIN", "DOCTOR", "NURSE"]),
  upload.single("resultFile"),
  uploadLabResult
);

router.get("/patient/:patientId", getPatientLabHistory);

router.get("/catalog", getLabTestCatalog);

export default router;
