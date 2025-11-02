import { Request, Response } from "express";
import prisma from "../config/database";
import { StorageService } from "../services/storage.service";
import { PubSubService } from "../services/pubsub.service";
import { NINService } from "../services/nin.service";
import { EmailService } from "../services/email.service";
import { QueueService } from "../services/queue.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { generatePatientNumber } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";

const storageService = new StorageService();
const pubsubService = new PubSubService();
const ninService = new NINService();
const emailService = new EmailService();
const queueService = new QueueService();

export const validateNIN = async (req: Request, res: Response) => {
  try {
    const { nin } = req.body;

    const result = await ninService.validateNIN(nin);

    res.json({
      status: "success",
      data: result,
    });
  } catch (error: any) {
    logger.error("NIN validation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const registerPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const patientData = req.body;

    // Generate patient number
    const patientCount = await prisma.patient.count({ where: { clinicId } });
    const patientNumber = generatePatientNumber(patientCount);

    // Upload photo if provided
    let photoUrl = null;
    if (req.file) {
      photoUrl = await storageService.uploadPatientPhoto(
        req.file,
        patientNumber
      );
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        clinicId,
        patientNumber,
        photoUrl,
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

    // Publish event
    await pubsubService.publishPatientRegistered({
      patientId: patient.id,
      patientNumber: patient.patientNumber,
      email: patient.email,
      clinicId,
    });

    // Send welcome email
    if (patient.email) {
      await emailService.sendWelcomeEmail(
        patient.email,
        patient.id,
        patient.patientNumber
      );
    }

    logger.info(`Patient registered: ${patient.patientNumber}`);

    res.status(201).json({
      status: "success",
      data: patient,
    });
  } catch (error: any) {
    logger.error("Register patient error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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

    res.json({
      status: "success",
      data: {
        patients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error("Get all patients error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    res.json({
      status: "success",
      data: patient,
    });
  } catch (error: any) {
    logger.error("Get patient by ID error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;
    const updateData = req.body;

    const patient = await prisma.patient.updateMany({
      where: { id, clinicId },
      data: updateData,
    });

    if (patient.count === 0) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }
  } catch (error: any) {
    logger.error("Patient updated error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
