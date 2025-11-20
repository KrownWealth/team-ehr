import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/database";
import { EmailService } from "../services/email.service";
import logger from "../utils/logger.utils";
import { Prisma } from "@prisma/client";
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  paginatedResponse,
} from "../utils/response.utils";

const emailService = new EmailService();

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, consultationId, prescriptions, notes } = req.body;
    const { clinicId, user } = req;

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
      return notFoundResponse(res, "Patient not found in this clinic");
    }

    if (prescriptions && prescriptions.length > 0 && patient.allergies) {
      const allergyConflicts = prescriptions.filter((med: any) =>
        patient.allergies!.some((allergy: string) =>
          med.drug.toLowerCase().includes(allergy.toLowerCase())
        )
      );

      if (allergyConflicts.length > 0) {
        return badRequestResponse(res, "Drug allergy conflict detected", {
          conflicts: allergyConflicts,
          allergies: patient.allergies,
        });
      }
    }

    if (consultationId) {
      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, clinicId, doctorId: user!.id },
      });

      if (!consultation) {
        return notFoundResponse(res, "Consultation not found or unauthorized");
      }

      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          prescriptions: prescriptions,
        },
      });
    }

    if (patient.email && prescriptions && prescriptions.length > 0) {
      await emailService.sendPrescriptionEmail(
        patient.email,
        prescriptions,
        patient.patientNumber
      );
    }

    logger.info(`Prescription created for patient: ${patientId}`);

    return createdResponse(
      res,
      {
        patientId,
        consultationId,
        prescriptions,
        notes,
      },
      "Prescription created successfully"
    );
  } catch (error: any) {
    logger.error("Create prescription error:", error);
    return serverErrorResponse(res, "Failed to create prescription", error);
  }
};

/**
 * Get all prescriptions with filtering
 */
export const getAllPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const {
      page = 1,
      limit = 20,
      patientId,
      doctorId,
      startDate,
      endDate,
      search,
    } = req.query;

    const where: any = {
      clinicId,
      prescriptions: { not: Prisma.JsonNull },
    };

    // Filter by patient
    if (patientId) {
      where.patientId = patientId;
    }

    // Filter by doctor
    if (doctorId) {
      where.doctorId = doctorId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Search in patient name
    if (search) {
      where.patient = {
        OR: [
          { firstName: { contains: search as string, mode: "insensitive" } },
          { lastName: { contains: search as string, mode: "insensitive" } },
          {
            patientNumber: { contains: search as string, mode: "insensitive" },
          },
        ],
      };
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          prescriptions: true,
          createdAt: true,
          patient: {
            select: {
              patientNumber: true,
              firstName: true,
              lastName: true,
              gender: true,
              birthDate: true,
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.consultation.count({ where }),
    ]);

    return paginatedResponse(
      res,
      consultations,
      {
        page: Number(page),
        limit: Number(limit),
        total,
      },
      "Prescriptions retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get all prescriptions error:", error);
    return serverErrorResponse(res, "Failed to retrieve prescriptions", error);
  }
};

export const getPatientPrescriptions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;
    const { limit = 20, page = 1 } = req.query;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
    });

    if (!patient) {
      return notFoundResponse(res, "Patient not found in this clinic");
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
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
      }),
      prisma.consultation.count({
        where: {
          patientId,
          clinicId,
          prescriptions: {
            not: Prisma.JsonNull,
          },
        },
      }),
    ]);

    return paginatedResponse(
      res,
      consultations,
      {
        page: Number(page),
        limit: Number(limit),
        total,
      },
      "Prescriptions retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get patient prescriptions error:", error);
    return serverErrorResponse(res, "Failed to retrieve prescriptions", error);
  }
};

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
            gender: true,
            birthDate: true,
            bloodGroup: true,
            allergies: true,
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
      return notFoundResponse(res, "Prescription not found");
    }

    return successResponse(
      res,
      consultation,
      "Prescription retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get prescription error:", error);
    return serverErrorResponse(res, "Failed to retrieve prescription", error);
  }
};

export const updatePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { prescriptions } = req.body;
    const { clinicId, user } = req;

    const consultation = await prisma.consultation.findFirst({
      where: { id, clinicId, doctorId: user!.id },
    });

    if (!consultation) {
      return notFoundResponse(res, "Consultation not found or unauthorized");
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: { prescriptions },
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

    logger.info(`Prescription updated: ${id}`);

    return successResponse(res, updated, "Prescription updated successfully");
  } catch (error: any) {
    logger.error("Update prescription error:", error);
    return serverErrorResponse(res, "Failed to update prescription", error);
  }
};

export const checkAllergies = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, drugs } = req.body;
    const { clinicId } = req;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: { allergies: true, firstName: true, lastName: true },
    });

    if (!patient) {
      return notFoundResponse(res, "Patient");
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

    return successResponse(
      res,
      {
        hasConflicts: conflicts.length > 0,
        conflicts,
        allergies: patient.allergies || [],
        patientName: `${patient.firstName} ${patient.lastName}`,
      },
      conflicts.length > 0
        ? "Allergy conflicts detected"
        : "No allergy conflicts found"
    );
  } catch (error: any) {
    logger.error("Check allergies error:", error);
    return serverErrorResponse(res, "Failed to check allergies", error);
  }
};
