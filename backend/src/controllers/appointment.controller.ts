import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import db from "../services/database.service";
import { EmailService } from "../services/email.service";
import logger from "../utils/logger.utils";

const emailService = new EmailService();

/**
 * GET /appointments
 * Retrieve all appointments for a clinic
 */
export const getAllAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { status } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        status: "error",
        message: "Missing clinic ID in request.",
      });
    }

    const appointments = await db.listAppointments(
      clinicId,
      status ? String(status) : undefined
    );

    return res.json({
      status: "success",
      data: appointments,
    });
  } catch (error: any) {
    logger.error("Get all appointments error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// export const getAppointmentById = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { clinicId } = req;

//     if (!clinicId) {
//       return res.status(400).json({
//         status: "error",
//         message: "Missing clinic ID in request.",
//       });
//     }

//     const appointment = await db.getAppointment(id, clinicId);
//     if (!appointment) {
//       return res.status(404).json({
//         status: "error",
//         message: "Appointment not found",
//       });
//     }

//     return res.json({
//       status: "success",
//       data: appointment,
//     });
//   } catch (error: any) {
//     logger.error("Get appointment by ID error:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// export const updateAppointment = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { clinicId } = req;
//     const updates = req.body;

//     if (!clinicId) {
//       return res.status(400).json({
//         status: "error",
//         message: "Missing clinic ID in request.",
//       });
//     }

//     const appointment = await db.getAppointment(id, clinicId);
//     if (!appointment) {
//       return res.status(404).json({
//         status: "error",
//         message: "Appointment not found",
//       });
//     }

//     // Directly update through Firestore reference
//     const ref = db.firestore().collection("appointments").doc(id);
//     const updatePayload = {
//       ...updates,
//       updatedAt: new Date(),
//     };

//     await ref.update(updatePayload);

//     logger.info(`✏️ Appointment updated: ${id}`);
//     return res.json({
//       status: "success",
//       data: { id, ...updatePayload },
//     });
//   } catch (error: any) {
//     logger.error("Update appointment error:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };
