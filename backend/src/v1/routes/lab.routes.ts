import { Router } from "express";
import type { Router as RouterType } from "express";
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

const router: RouterType = Router();

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

/**
 * GET /api/v1/labs/orders
 * Get all lab orders with filtering
 * Query params: status, patientId, urgency, page, limit
 */
router.get("/orders", getAllLabOrders);

/**
 * GET /api/v1/labs/orders/:id
 * Get lab order details by ID
 */
router.get("/orders/:id", getLabOrderById);

/**
 * PATCH /api/v1/labs/orders/:id/status
 * Update lab order status
 * Requires: ADMIN, DOCTOR, NURSE
 */
router.patch(
  "/orders/:id/status",
  authorize(["ADMIN", "DOCTOR", "NURSE"]),
  updateLabOrderStatus
);

/**
 * POST /api/v1/labs/orders/:id/result
 * Upload lab result file
 * Requires: ADMIN, DOCTOR, NURSE
 */
router.post(
  "/orders/:id/result",
  authorize(["ADMIN", "DOCTOR", "NURSE"]),
  upload.single("resultFile"),
  uploadLabResult
);

/**
 * GET /api/v1/labs/patient/:patientId
 * Get patient's lab history
 */
router.get("/patient/:patientId", getPatientLabHistory);

/**
 * GET /api/v1/labs/catalog
 * Get lab test catalog
 */
router.get("/catalog", getLabTestCatalog);

export default router;
