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
import labRoutes from "./lab.routes";
import billingRoutes from "./billing.routes";
import reportsRoutes from "./report.routes";
import aiRoutes from "./ai.routes";
import systemRoutes from "./system.routes";
import { tenantRoutes } from "./tenant.routes";
import { notificationRoutes } from "./notification.routes";

// Initialize router
const router = express.Router();

// Mount all routes with base paths

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/clinic", clinicRoutes);
router.use("/staff", staffRoutes);
router.use("/patients", patientRoutes);
router.use("/queue", queueRoutes);
router.use("/vitals", vitalsRoutes);
router.use("/consultations", consultationRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/labs", labRoutes);
router.use("/billing", billingRoutes);
router.use("/reports", reportsRoutes);
router.use("/ai", aiRoutes);
router.use("/system", systemRoutes);
router.use("/tenant", tenantRoutes);
router.use("/notifications", notificationRoutes);

export default router;
