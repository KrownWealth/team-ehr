import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  getClinics,
  getClinicById,
  updateClinic,
} from "../../controllers/clinic.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { getClinicProfile } from "../../controllers/admin.controller";
import { validate } from "../../middleware/validation.middleware";
import { clinicValidator } from "../../validators/clinic.validator";
import { onboardClinic } from "../../controllers/admin.controller";

const router: RouterType = Router();

router.use(authenticate);
router.use(tenantIsolation);
router.use(authorize(["ADMIN"]));

router.post("/onboard", clinicValidator, validate, onboardClinic);

router.get("/", getClinics);

router.get("/profile", getClinicProfile);
router.put("/", updateClinic);

router.get("/:id", getClinicById);

router.patch("/:id", tenantIsolation, authorize(["ADMIN"]), updateClinic);

router.get("/:id/settings", (req, res) =>
  res.json({
    status: "success",
    message: "Get clinic settings - Not implemented yet",
  })
);

router.patch("/:id/settings", (req, res) =>
  res.json({
    status: "success",
    message: "Update clinic settings - Not implemented yet",
  })
);

export default router;
