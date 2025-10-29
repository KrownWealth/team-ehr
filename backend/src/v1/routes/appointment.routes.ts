import { Router } from "express";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  checkInAppointment,
  startConsultation,
  completeAppointment,
  cancelAppointment,
  getTodayAppointments,
} from "../../controllers/appointment.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";
import { validate } from "../../middleware/validation.middleware";
import { appointmentValidator } from "../../validators/appointment.validator";
import { idempotencyCheck } from "../../middleware/idempotency.middleware";

const router = Router();

// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

/**
 * POST /api/v1/appointments
 * Create a new appointment
 * Requires: ADMIN, CLERK, DOCTOR, NURSE
 */
router.post(
  "/",
  authorize(["ADMIN", "CLERK", "DOCTOR", "NURSE"]),
  idempotencyCheck({ required: true }),
  appointmentValidator,
  validate,
  createAppointment
);

/**
 * GET /api/v1/appointments
 * Get all appointments with filtering
 * Query params: date, status, patientId, page, limit
 */
router.get("/", getAllAppointments);

/**
 * GET /api/v1/appointments/today
 * Get today's appointments with summary
 */
router.get("/today", getTodayAppointments);

/**
 * GET /api/v1/appointments/:id
 * Get appointment by ID
 */
router.get("/:id", getAppointmentById);

/**
 * PUT /api/v1/appointments/:id
 * Update appointment details
 * Requires: ADMIN, CLERK, DOCTOR, NURSE
 */
router.put(
  "/:id",
  authorize(["ADMIN", "CLERK", "DOCTOR", "NURSE"]),
  updateAppointment
);

/**
 * POST /api/v1/appointments/:id/check-in
 * Check in patient for appointment (adds to queue)
 * Requires: CLERK, NURSE
 */
router.post(
  "/:id/check-in",
  authorize(["CLERK", "NURSE"]),
  idempotencyCheck(),
  checkInAppointment
);

/**
 * POST /api/v1/appointments/:id/start-consultation
 * Start consultation for appointment
 * Requires: DOCTOR
 */
router.post(
  "/:id/start-consultation",
  authorize(["DOCTOR"]),
  startConsultation
);

/**
 * POST /api/v1/appointments/:id/complete
 * Mark appointment as completed
 * Requires: DOCTOR, NURSE
 */
router.post(
  "/:id/complete",
  authorize(["DOCTOR", "NURSE"]),
  completeAppointment
);

/**
 * POST /api/v1/appointments/:id/cancel
 * Cancel appointment
 * Requires: ADMIN, CLERK, DOCTOR, NURSE
 */
router.post(
  "/:id/cancel",
  authorize(["ADMIN", "CLERK", "DOCTOR", "NURSE"]),
  cancelAppointment
);

export default router;
