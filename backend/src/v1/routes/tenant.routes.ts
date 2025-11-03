import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import db from "../../services/database.service";
import logger from "../../utils/logger.utils";

const router = Router();

router.use(authenticate);
router.use(authorize(["ADMIN"]));

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const clinics = await db.listClinics(Number(limit));

    // Filter by search if provided
    let filteredClinics = clinics;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredClinics = clinics.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(searchTerm) ||
          clinic.email.toLowerCase().includes(searchTerm)
      );
    }

    // Manual pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedClinics = filteredClinics.slice(startIndex, endIndex);

    // Get user counts for each clinic
    const clinicsWithCounts = await Promise.all(
      paginatedClinics.map(async (clinic) => {
        const users = await db.listUsers(clinic.id!);
        const patients = await db.listPatients(clinic.id!);

        return {
          ...clinic,
          _count: {
            users: users.length,
            patients: patients.length,
          },
        };
      })
    );

    res.json({
      status: "success",
      data: {
        clinics: clinicsWithCounts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredClinics.length,
          pages: Math.ceil(filteredClinics.length / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error("Get tenants error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/tenant/:id
 * Get clinic details by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await db.getClinic(id);

    if (!clinic) {
      return res.status(404).json({
        status: "error",
        message: "Tenant not found",
      });
    }

    // Get counts
    const [users, patients, consultations] = await Promise.all([
      db.listUsers(id),
      db.listPatients(id),
      db.listConsultations("", id), // Empty patientId to get all
    ]);

    const clinicWithCounts = {
      ...clinic,
      _count: {
        users: users.length,
        patients: patients.length,
        consultations: consultations.length,
        bills: 0, // Would need to implement bill listing in db service
      },
    };

    res.json({
      status: "success",
      data: clinicWithCounts,
    });
  } catch (error: any) {
    logger.error("Get tenant error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/tenant/:id
 * Deactivate a clinic (soft delete)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await db.updateClinic(id, { isActive: false });

    if (!clinic) {
      return res.status(404).json({
        status: "error",
        message: "Tenant not found",
      });
    }

    logger.info(`Tenant deactivated: ${id}`);

    res.json({
      status: "success",
      message: "Tenant deactivated successfully",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Delete tenant error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
