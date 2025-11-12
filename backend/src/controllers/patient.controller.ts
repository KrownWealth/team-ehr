import { Response } from "express";
import prisma from "../config/database";
import { EmailService } from "../services/email.service";
import { QueueService } from "../services/queue.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { generatePatientNumber } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  serverErrorResponse,
  paginatedResponse,
} from "../utils/response.utils";

const emailService = new EmailService();
const queueService = new QueueService();

export const registerPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const patientData = req.body;

    // Generate patient number
    const patientCount = await prisma.patient.count({ where: { clinicId } });
    const patientNumber = generatePatientNumber(patientCount);

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        clinicId,
        patientNumber,
        birthDate: new Date(patientData.birthDate),
      },
    });

    // Add to queue
    await queueService.addToQueue(
      patient.id,
      `${patient.firstName} ${patient.lastName}`,
      clinicId!,
      0
    );

    // Send welcome email
    if (patient.email) {
      await emailService.sendWelcomeEmail(
        patient.email,
        patient.id,
        patient.patientNumber
      );
    }

    logger.info(`Patient registered: ${patient.patientNumber}`);

    return createdResponse(res, patient, "Patient registered successfully");
  } catch (error: any) {
    logger.error("Register patient error:", error);
    return serverErrorResponse(res, "Failed to register patient", error);
  }
};

export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { page = 1, limit = 20, search } = req.query;

    const where: any = { clinicId, isActive: true };

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: "insensitive" } },
        { lastName: { contains: search as string, mode: "insensitive" } },
        { patientNumber: { contains: search as string, mode: "insensitive" } },
        { phone: { contains: search as string } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.patient.count({ where }),
    ]);

    return paginatedResponse(
      res,
      patients,
      {
        page: Number(page),
        limit: Number(limit),
        total,
      },
      "Patients retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get all patients error:", error);
    return serverErrorResponse(res, "Failed to retrieve patients", error);
  }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const patient = await prisma.patient.findFirst({
      where: { id, clinicId },
      include: {
        vitals: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointments: {
          where: {
            appointmentDate: { gte: new Date() },
          },
          orderBy: { appointmentDate: "asc" },
        },
      },
    });

    if (!patient) {
      return notFoundResponse(res, "Patient");
    }

    return successResponse(res, patient, "Patient retrieved successfully");
  } catch (error: any) {
    logger.error("Get patient by ID error:", error);
    return serverErrorResponse(res, "Failed to retrieve patient", error);
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;
    const updateData = req.body;

    const result = await prisma.patient.updateMany({
      where: { id, clinicId },
      data: updateData,
    });

    if (result.count === 0) {
      return notFoundResponse(res, "Patient");
    }

    // Fetch updated patient
    const patient = await prisma.patient.findFirst({
      where: { id, clinicId },
    });

    logger.info(`Patient updated: ${id}`);

    return successResponse(res, patient, "Patient updated successfully");
  } catch (error: any) {
    logger.error("Patient update error:", error);
    return serverErrorResponse(res, "Failed to update patient", error);
  }
};
