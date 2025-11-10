import { Router } from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  activateStaff,
  updateProfile,
} from "../../controllers/admin.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { staffValidator } from "../../validators/staff.validator";
import { validate } from "../../middleware/validation.middleware";

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

// ✅ FIX: Allow all authenticated users to view their own profile
router.get("/me", updateProfile);

// Admin-only routes
router.post(
  "/create",
  authorize(["ADMIN"]),
  staffValidator,
  validate,
  createStaff
);

router.get("/", authorize(["ADMIN"]), getAllStaff);

router.get(
  "/:id",
  async (req, res, next) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (userId === id || (req as any).user?.role === "ADMIN") {
      return next();
    }

    return res.status(403).json({
      status: "error",
      message: "You can only view your own profile",
    });
  },
  getStaffById
);

router.patch("/:id", authorize(["ADMIN"]), updateStaff);

router.patch("/:id/deactivate", authorize(["ADMIN"]), deactivateStaff);

router.patch("/:id/activate", authorize(["ADMIN"]), activateStaff);

router.delete("/:id", authorize(["ADMIN"]), deactivateStaff);

export default router;
