import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import db, { QueueEntry, Consultation } from "../services/database.service";
import { EmailService } from "../services/email.service";
import logger from "../utils/logger.utils";

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

    // Get patient details
    const patient = await db.getPatient(patientId, clinicId!);
    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    // Get doctor assigned from queue
    const queueEntries: QueueEntry[] = await db.getQueue(clinicId!);
    const queueEntry = queueEntries.find(
      (q) => q.patientId === patientId && q.status === "IN_CONSULTATION"
    );

    if (!queueEntry || !queueEntry.doctorId) {
      return res.status(400).json({
        status: "error",
        message: "Patient has not been assigned to a doctor yet.",
      });
    }

    const doctorId = queueEntry.doctorId;

    // Check for drug allergies
    if (prescriptions?.length && (patient as any).allergies?.length) {
      const allergyConflicts = prescriptions.filter((med: any) =>
        (patient as any).allergies.some((allergy: string) =>
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

    const consultation = await db.createConsultation(
      clinicId!,
      {
        patientId,
        subjective,
        objective,
        assessment,
        plan,
        prescriptions: prescriptions || [],
        labOrders: labOrders || [],
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      doctorId // <-- pass doctorId separately
    );

    if (prescriptions?.length && (patient as any).email) {
      await emailService.sendPrescriptionEmail(
        (patient as any).email,
        prescriptions,
        (patient as any).patientNumber
      );
    }

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
// Get consultation by ID
export const getConsultationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const consultations = await db.listConsultations(id, clinicId!);
    const consultation = consultations.find((c) => c.id === id);

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
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId, user } = req;
    const updateData = req.body;

    const consultations = (await db.listConsultations(
      id,
      clinicId!
    )) as Consultation[];
    const consultation = consultations.find(
      (c) => c.id === id && c.doctorId === user!.id
    );

    if (!consultation) {
      return res.status(404).json({
        status: "error",
        message: "Consultation not found or unauthorized",
      });
    }

    const updatedConsultation = {
      ...consultation,
      ...updateData,
      updatedAt: new Date(),
    };

    // Overwrite in Firestore
    await db.createConsultation(
      clinicId!,
      updatedConsultation,
      updatedConsultation.doctorId
    );

    logger.info(`Consultation updated: ${id}`);

    res.json({
      status: "success",
      data: updatedConsultation,
    });
  } catch (error: any) {
    logger.error("Update consultation error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getPatientConsultations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;

    const consultations = await db.listConsultations(patientId, clinicId!);
    const patientConsultations = consultations.filter(
      (c) => c.patientId === patientId
    );

    res.json({
      status: "success",
      data: patientConsultations,
    });
  } catch (error: any) {
    logger.error("Get patient consultations error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
