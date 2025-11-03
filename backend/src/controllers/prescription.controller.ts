import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/database";
import { EmailService } from "../services/email.service";
import logger from "../utils/logger.utils";
import { Prisma } from "@prisma/client";

const emailService = new EmailService();

/**
 * Create prescription (standalone or part of consultation)
 */
export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, consultationId, prescriptions, notes } = req.body;
    const { clinicId, user } = req;

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        patientNumber: true,
        allergies: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found in this clinic",
      });
    }

    // Check for drug allergies
    if (prescriptions && prescriptions.length > 0 && patient.allergies) {
      const allergyConflicts = prescriptions.filter((med: any) =>
        patient.allergies!.some((allergy: string) =>
          med.drug.toLowerCase().includes(allergy.toLowerCase())
        )
      );

      if (allergyConflicts.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Drug allergy conflict detected",
          conflicts: allergyConflicts,
          allergies: patient.allergies,
        });
      }
    }

    // If consultationId provided, update consultation
    if (consultationId) {
      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, clinicId, doctorId: user!.id },
      });

      if (!consultation) {
        return res.status(404).json({
          status: "error",
          message: "Consultation not found or unauthorized",
        });
      }

      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          prescriptions: prescriptions,
        },
      });
    }

    // Send prescription email
    if (patient.email && prescriptions && prescriptions.length > 0) {
      await emailService.sendPrescriptionEmail(
        patient.email,
        prescriptions,
        patient.patientNumber
      );
    }

    logger.info(`Prescription created for patient: ${patientId}`);

    res.status(201).json({
      status: "success",
      data: {
        patientId,
        consultationId,
        prescriptions,
        notes,
      },
      message: "Prescription created successfully",
    });
  } catch (error: any) {
    logger.error("Create prescription error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get patient prescriptions
 */
export const getPatientPrescriptions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;
    const { limit = 20, page = 1 } = req.query;

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found in this clinic",
      });
    }

    // Get consultations with prescriptions
    const consultations = await prisma.consultation.findMany({
      where: {
        patientId,
        clinicId,
        prescriptions: { not: Prisma.JsonNull },
      },
      select: {
        id: true,
        prescriptions: true,
        createdAt: true,
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            licenseId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.consultation.count({
      where: {
        patientId,
        clinicId,
        prescriptions: {
          not: Prisma.JsonNull,
        },
      },
    });

    res.json({
      status: "success",
      data: {
        prescriptions: consultations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error("Get patient prescriptions error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const consultation = await prisma.consultation.findFirst({
      where: { id, clinicId },
      select: {
        id: true,
        prescriptions: true,
        createdAt: true,
        patient: {
          select: {
            patientNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            licenseId: true,
          },
        },
      },
    });

    if (!consultation) {
      return res.status(404).json({
        status: "error",
        message: "Prescription not found",
      });
    }

    res.json({
      status: "success",
      data: consultation,
    });
  } catch (error: any) {
    logger.error("Get prescription error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Update prescription
 */
export const updatePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { prescriptions } = req.body;
    const { clinicId, user } = req;

    const consultation = await prisma.consultation.findFirst({
      where: { id, clinicId, doctorId: user!.id },
    });

    if (!consultation) {
      return res.status(404).json({
        status: "error",
        message: "Consultation not found or unauthorized",
      });
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: { prescriptions },
    });

    logger.info(`Prescription updated: ${id}`);

    res.json({
      status: "success",
      data: updated,
      message: "Prescription updated successfully",
    });
  } catch (error: any) {
    logger.error("Update prescription error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Check drug allergies
 */
export const checkAllergies = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, drugs } = req.body;
    const { clinicId } = req;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: { allergies: true },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    const conflicts: any[] = [];
    if (patient.allergies && drugs && drugs.length > 0) {
      drugs.forEach((drug: string) => {
        patient.allergies!.forEach((allergy: string) => {
          if (drug.toLowerCase().includes(allergy.toLowerCase())) {
            conflicts.push({
              drug,
              allergy,
              severity: "HIGH",
              message: `Patient is allergic to ${allergy}`,
            });
          }
        });
      });
    }

    res.json({
      status: "success",
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
        allergies: patient.allergies || [],
      },
    });
  } catch (error: any) {
    logger.error("Check allergies error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
