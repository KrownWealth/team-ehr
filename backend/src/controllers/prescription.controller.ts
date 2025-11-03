import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { EmailService } from "../services/email.service";
import db from "../services/database.service";
import logger from "../utils/logger.utils";

const emailService = new EmailService();

/**
 * Create a prescription
 */
export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, consultationId, prescriptions, notes } = req.body;
    const { clinicId, user } = req;

    // Verify patient exists
    const patient = await db.getPatient(patientId, clinicId!);
    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found in this clinic",
      });
    }

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
          allergies: patient.allergies,
        });
      }
    }

    let prescriptionRecord;

    if (consultationId) {
      // Attach prescription to existing consultation
      const consultations = await db.listConsultations(
        consultationId,
        clinicId!
      );
      const consultation = consultations.find(
        (c) => c.id === consultationId && c.doctorId === user!.id
      );

      if (!consultation) {
        return res.status(404).json({
          status: "error",
          message: "Consultation not found or unauthorized",
        });
      }

      const updatedPrescriptions = [
        ...(consultation.prescriptions || []),
        ...prescriptions,
      ];

      // Overwrite consultation
      prescriptionRecord = {
        ...consultation,
        prescriptions: updatedPrescriptions,
        notes,
        updatedAt: new Date(),
      };

      // Firestore method expects clinicId, data object, and doctorId
      await db.createConsultation(clinicId!, prescriptionRecord, user!.id);
    } else {
      // Create a new prescription document
      prescriptionRecord = await db.createPrescription({
        clinicId: clinicId!,
        patientId,
        doctorId: user!.id,
        prescriptions,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Send prescription email
    if (prescriptions?.length && (patient as any).email) {
      await emailService.sendPrescriptionEmail(
        (patient as any).email,
        prescriptions,
        (patient as any).patientNumber
      );
    }

    logger.info(`Prescription created for patient: ${patientId}`);

    res.status(201).json({
      status: "success",
      data: prescriptionRecord,
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
 * Get prescriptions for a patient
 */
export const getPatientPrescriptions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;
    const { limit = 20, page = 1 } = req.query;

    const prescriptions = await db.listPrescriptions(
      patientId,
      clinicId!,
      Number(limit),
      Number(page)
    );

    res.json({
      status: "success",
      data: prescriptions,
    });
  } catch (error: any) {
    logger.error("Get patient prescriptions error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Update a prescription
 */
export const updatePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { prescriptions, notes } = req.body;
    const { clinicId, user } = req;

    const consultations = await db.listConsultations(id, clinicId!);
    const consultation = consultations.find(
      (c) => c.id === id && c.doctorId === user!.id
    );

    if (!consultation) {
      return res.status(404).json({
        status: "error",
        message: "Prescription not found or unauthorized",
      });
    }

    const updated = {
      ...consultation,
      prescriptions,
      notes,
      updatedAt: new Date(),
    };

    // Firestore overwrite
    await db.createConsultation(clinicId!, updated, user!.id);

    logger.info(`Prescription updated: ${id}`);

    res.json({
      status: "success",
      data: updated,
      message: "Prescription updated successfully",
    });
  } catch (error: any) {
    logger.error("Update prescription error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Check drug allergies
 */
export const checkAllergies = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, drugs } = req.body;
    const { clinicId } = req;

    const patient = await db.getPatient(patientId, clinicId!);
    if (!patient) {
      return res
        .status(404)
        .json({ status: "error", message: "Patient not found" });
    }

    const conflicts: any[] = [];
    if ((patient as any).allergies?.length && drugs?.length) {
      drugs.forEach((drug: string) => {
        (patient as any).allergies.forEach((allergy: string) => {
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
        allergies: (patient as any).allergies || [],
      },
    });
  } catch (error: any) {
    logger.error("Check allergies error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
