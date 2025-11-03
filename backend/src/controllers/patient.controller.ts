import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import db from "../services/database.service";
import { EmailService } from "../services/email.service";
import logger from "../utils/logger.utils";

const emailService = new EmailService();

export const registerPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { addToQueue = true, ...patientData } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        status: "error",
        message: "Missing clinic ID in request.",
      });
    }

    // Create patient and optionally add to queue
    const patient = await db.createPatient(clinicId, {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      phone: patientData.phone,
      gender: patientData.gender,
      dateOfBirth: patientData.dateOfBirth,
    });

    // Optionally add to queue
    if (addToQueue) {
      await db.addToQueue(patient.id, clinicId);
    }

    // Send welcome email (optional)
    if (patientData.email) {
      await emailService.sendWelcomeEmail(
        patientData.email,
        patient.id,
        patient.patientNumber!
      );
    }

    logger.info(`👤 Patient registered: ${patient.patientNumber}`);

    return res.status(201).json({
      status: "success",
      data: patient,
    });
  } catch (error: any) {
    logger.error("Register patient error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { limit = 20 } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        status: "error",
        message: "Missing clinic ID in request.",
      });
    }

    const patients = await db.listPatients(clinicId, Number(limit));

    return res.json({
      status: "success",
      data: patients,
    });
  } catch (error: any) {
    logger.error("Get all patients error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET /patients/:id
 * Retrieve a single patient and recent related data.
 */
export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    if (!clinicId) {
      return res.status(400).json({
        status: "error",
        message: "Missing clinic ID in request.",
      });
    }

    const patient = await db.getPatient(id, clinicId);
    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    // Fetch recent vitals and consultations
    const [vitals, consultations, appointments] = await Promise.all([
      db.getPatientVitals(id, clinicId, 5),
      db.listConsultations(id, clinicId, 10),
      db.listAppointments(clinicId, undefined, 10),
    ]);

    return res.json({
      status: "success",
      data: {
        ...patient,
        vitals,
        consultations,
        appointments,
      },
    });
  } catch (error: any) {
    logger.error("Get patient by ID error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// export const updatePatient = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { clinicId } = req;
//     const updateData = req.body;

//     if (!clinicId) {
//       return res.status(400).json({
//         status: "error",
//         message: "Missing clinic ID in request.",
//       });
//     }

//     const patient = await db.getPatient(id, clinicId);
//     if (!patient) {
//       return res.status(404).json({
//         status: "error",
//         message: "Patient not found",
//       });
//     }

//     const ref = db.firestore().collection("patients").doc(id);
//     const updatePayload = {
//       ...updateData,
//       updatedAt: new Date(),
//     };

//     await ref.update(updatePayload);

//     logger.info(`✏️ Patient updated: ${id}`);
//     return res.json({
//       status: "success",
//       data: { id, ...updatePayload },
//     });
//   } catch (error: any) {
//     logger.error("Update patient error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };
