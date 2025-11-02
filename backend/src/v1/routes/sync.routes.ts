import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  syncData,
  getSyncStatus,
  fullSync,
} from "../../controllers/sync.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router: RouterType = Router();

// All sync routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

/**
 * POST /api/v1/sync
 * Main synchronization endpoint
 * Body: { lastSyncTimestamp?: string, pendingActions: SyncAction[] }
 */
router.post("/", syncData);

/**
 * GET /api/v1/sync/status?lastSyncTimestamp=ISO8601
 * Check if there are server updates without sending pending actions
 */
router.get("/status", getSyncStatus);

/**
 * POST /api/v1/sync/full
 * Force a complete data redownloada
 */
router.post("/full", fullSync);

export default router;
