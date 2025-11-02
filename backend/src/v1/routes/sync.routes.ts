import { Router } from "express";
import {
  syncData,
  getSyncStatus,
  fullSync,
} from "../../controllers/sync.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.post("/", syncData);

router.get("/status", getSyncStatus);

router.post("/full", fullSync);

export default router;
