// backend/src/controllers/consultation.controller.ts
import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { EmailService } from "../services/email.service";
import logger from "../utils/logger.utils";
import {
  createdResponse,
  notFoundResponse,
  paginatedResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/response.utils";

const emailService = new EmailService();

export const createConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      subjective,
      objective,
      assessment,
      plan,
      prescriptions,
      labOrders,
      followUpDate,
    } = req.body;
    const { clinicId, user } = req;

    // Get patient details for allergy check
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
      return notFoundResponse(res, "Patient");
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
          data: {
            conflicts: allergyConflicts,
            allergies: patient.allergies,
          },
        });
      }
    }

    const consultation = await prisma.consultation.create({
      data: {
        clinicId: clinicId!,
        patientId,
        doctorId: user!.id,
        subjective,
        objective,
        assessment,
        plan,
        prescriptions: prescriptions || [],
        labOrders: labOrders || [],
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      include: {
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

    // Send prescription email if prescriptions exist
    if (prescriptions && prescriptions.length > 0 && patient.email) {
      await emailService.sendPrescriptionEmail(
        patient.email,
        prescriptions,
        patient.patientNumber
      );
    }

    logger.info(`Consultation created: ${consultation.id}`);

    return createdResponse(
      res,
      consultation,
      "Consultation created successfully"
    );
  } catch (error: any) {
    logger.error("Create consultation error:", error);
    return serverErrorResponse(res, "Failed to create consultation", error);
  }
};

/**
 * ✅ UNIFIED: Get all consultations for the clinic with filtering
 */
export const getAllConsultations = async (req: AuthRequest, res: Response) => {
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

    const where: any = { clinicId };

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

    // Search in assessment or patient name
    if (search) {
      where.OR = [
        { assessment: { contains: search as string, mode: "insensitive" } },
        {
          patient: {
            OR: [
              {
                firstName: { contains: search as string, mode: "insensitive" },
              },
              { lastName: { contains: search as string, mode: "insensitive" } },
              {
                patientNumber: {
                  contains: search as string,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
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
      }),
      prisma.consultation.count({ where }),
    ]);

    // ✅ UNIFIED: Return consultations directly in data array
    return paginatedResponse(
      res,
      consultations,
      {
        page: Number(page),
        limit: Number(limit),
        total,
      },
      "Consultations retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get all consultations error:", error);
    return serverErrorResponse(res, "Failed to retrieve consultations", error);
  }
};

export const getConsultationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const consultation = await prisma.consultation.findFirst({
      where: { id, clinicId },
      include: {
        patient: {
          select: {
            patientNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
            birthDate: true,
            bloodGroup: true,
            allergies: true,
            chronicConditions: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            licenseId: true,
          },
        },
      },
    });

    if (!consultation) {
      return notFoundResponse(res, "Consultation");
    }

    return successResponse(
      res,
      consultation,
      "Consultation retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get consultation by ID error:", error);
    return serverErrorResponse(res, "Failed to retrieve consultation", error);
  }
};

export const updateConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId, user } = req;
    const updateData = req.body;

    const consultation = await prisma.consultation.findFirst({
      where: { id, clinicId, doctorId: user!.id },
    });

    if (!consultation) {
      return notFoundResponse(res, "Consultation not found or unauthorized");
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        ...updateData,
        followUpDate: updateData.followUpDate
          ? new Date(updateData.followUpDate)
          : undefined,
      },
      include: {
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

    logger.info(`Consultation updated: ${id}`);

    return successResponse(res, updated, "Consultation updated successfully");
  } catch (error: any) {
    logger.error("Update consultation error:", error);
    return serverErrorResponse(res, "Failed to update consultation", error);
  }
};

/**
 * ✅ UNIFIED: Get patient consultations
 */
export const getPatientConsultations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;
    const { page = 1, limit = 20 } = req.query;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
    });

    if (!patient) {
      return notFoundResponse(res, "Patient");
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where: {
          patientId,
          clinicId,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true,
              licenseId: true,
            },
          },
        },
      }),
      prisma.consultation.count({
        where: {
          patientId,
          clinicId,
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
      "Patient consultations retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get patient consultations error:", error);
    return serverErrorResponse(res, "Failed to retrieve consultations", error);
  }
};
