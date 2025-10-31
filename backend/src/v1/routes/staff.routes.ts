import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  activateStaff,
} from "../../controllers/admin.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { staffValidator } from "../../validators/staff.validator";
import { validate } from "../../middleware/validation.middleware";

const router: RouterType = Router();

router.use(authenticate);
router.use(tenantIsolation);
router.use(authorize(["ADMIN"]));

router.post("/create", staffValidator, validate, createStaff);

router.get("/", getAllStaff);

router.get("/:id", getStaffById);

router.patch("/:id", updateStaff);

router.patch("/:id/deactivate", deactivateStaff);

router.patch("/:id/activate", activateStaff);

router.delete("/:id", deactivateStaff);

export default router;
