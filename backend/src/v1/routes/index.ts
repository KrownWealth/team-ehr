import express from "express";

// Import all route modules
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import clinicRoutes from "./clinic.routes";
import staffRoutes from "./staff.routes";
import patientRoutes from "./patient.routes";
import queueRoutes from "./queue.routes";
import vitalsRoutes from "./vital.routes";
import consultationRoutes from "./consultation.routes";
import prescriptionRoutes from "./prescription.routes";
import aiRoutes from "./ai.routes";
import systemRoutes from "./system.routes";
import tenantRoutes from "./tenant.routes";
import patientPortalRoutes from "./patient-portal.routes";
import appointmentRoutes from "./appointment.routes";

// Initialize router
const router = express.Router();

// Mount all routes with base paths

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/clinic", clinicRoutes);
router.use("/staff", staffRoutes);
router.use("/patient", patientRoutes);
router.use("/queue", queueRoutes);
router.use("/vitals", vitalsRoutes);
router.use("/consultation", consultationRoutes);
router.use("/prescription", prescriptionRoutes);
router.use("/ai", aiRoutes);
router.use("/system", systemRoutes);
router.use("/tenant", tenantRoutes);
router.use("/patient-portal", patientPortalRoutes);
router.use("/appointment", appointmentRoutes);

export default router;
