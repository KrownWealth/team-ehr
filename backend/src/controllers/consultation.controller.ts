import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { PubSubService } from "../services/pubsub.service";
import { EmailService } from "../services/email.service";
import { QueueService } from "../services/queue.service";
import logger from "../utils/logger.utils";

const pubsubService = new PubSubService();
const emailService = new EmailService();
const queueService = new QueueService();

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
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        allergies: true,
        email: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
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
        patient: true,
        doctor: {
          select: {
            firstName: true,
            lastName: true,
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

    // Publish consultation completed event
    await pubsubService.publishConsultationCompleted({
      consultationId: consultation.id,
      patientId,
      clinicId,
      prescriptions,
    });

    logger.info(`Consultation created: ${consultation.id}`);

    res.status(201).json({
      status: "success",
      data: consultation,
    });
  } catch (error: any) {
    logger.error("Create consultation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getConsultationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const consultation = await prisma.consultation.findFirst({
      where: { id, clinicId },
      include: {
        patient: true,
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
      return res.status(404).json({
        status: "error",
        message: "Consultation not found",
      });
    }

    res.json({
      status: "success",
      data: consultation,
    });
  } catch (error: any) {
    logger.error("Get consultation by ID error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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
      return res.status(404).json({
        status: "error",
        message: "Consultation not found or unauthorized",
      });
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Consultation updated: ${id}`);

    res.json({
      status: "success",
      data: updated,
    });
  } catch (error: any) {
    logger.error("Update consultation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getPatientConsultations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;

    const consultations = await prisma.consultation.findMany({
      where: {
        patientId,
        clinicId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      status: "success",
      data: consultations,
    });
  } catch (error: any) {
    logger.error("Get patient consultations error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
