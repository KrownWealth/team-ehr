import { Router } from "express";
import {
  onboardClinic,
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  activateStaff,
  getClinicProfile,
  updateClinic,
  updateProfile,
  getDashboardStats,
} from "../../controllers/admin.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import { clinicValidator } from "../../validators/clinic.validator";

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Clinic onboarding (no tenant isolation yet)
router.post("/clinic/onboard", clinicValidator, validate, onboardClinic);

// Routes requiring tenant isolation and admin role
router.use(tenantIsolation);
router.use(authorize(["ADMIN"]));

// Clinic Management
router.get("/clinic/profile", getClinicProfile);
router.put("/clinic", updateClinic);

// Staff Management
router.post("/staff", createStaff);
router.get("/staff", getAllStaff);
router.get("/staff/:id", getStaffById);
router.put("/staff/:id", updateStaff);
router.patch("/staff/:id/deactivate", deactivateStaff);
router.patch("/staff/:id/activate", activateStaff);

// Profile Management
router.put("/profile", updateProfile);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

export default router;
