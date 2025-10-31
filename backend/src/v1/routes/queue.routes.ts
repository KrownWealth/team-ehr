import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  addToQueue,
  getClinicQueue,
  updateQueueStatus,
  removeFromQueue,
  getNextPatient,
} from "../../controllers/queue.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  addToQueueValidator,
  getQueueValidator,
} from "../../validators/queue.validator";

const router: RouterType = Router();

// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

router.post(
  "/add",
  authorize(["CLERK", "NURSE"]),
  addToQueueValidator,
  validate,
  addToQueue
);

router.get("/", getClinicQueue);

router.get("/next", authorize(["DOCTOR", "NURSE"]), getNextPatient);

router.patch(
  "/:id/status",
  authorize(["DOCTOR", "NURSE"]),
  getQueueValidator,
  validate,
  updateQueueStatus
);

router.delete("/:id", authorize(["CLERK", "NURSE"]), removeFromQueue);

export default router;
