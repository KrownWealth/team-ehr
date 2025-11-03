import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import db from "../services/database.service";
import { calculateBMI, checkVitalFlags } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";

export const recordVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, ...vitalsData } = req.body;
    const { clinicId, user } = req;

    // Verify patient exists
    const patient = await db.getPatient(patientId, clinicId!);
    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    // Calculate BMI
    let bmi = 0;
    if (vitalsData.weight && vitalsData.height) {
      bmi = calculateBMI(vitalsData.weight, vitalsData.height);
    }

    // Check for abnormal flags
    const flags = checkVitalFlags(vitalsData);

    // Create vitals record in Firestore
    const vitalsRecord = await db.createVitals({
      clinicId: clinicId!,
      patientId,
      recordedBy: user!.id,
      ...vitalsData,
      bmi,
      flags,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info(`Vitals recorded for patient: ${patientId}`);

    res.status(201).json({
      status: "success",
      data: vitalsRecord,
      alerts: flags.filter((f) => f.startsWith("CRITICAL")),
    });
  } catch (error: any) {
    logger.error("Record vitals error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getPatientVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;
    const { limit = 10, page = 1 } = req.query;

    const vitals = await db.listVitals(
      patientId,
      clinicId!,
      Number(limit),
      Number(page)
    );

    res.json({
      status: "success",
      data: vitals,
    });
  } catch (error: any) {
    logger.error("Get patient vitals error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { ...updateData } = req.body;

    // Recalculate BMI if weight/height provided
    if (updateData.weight && updateData.height) {
      updateData.bmi = calculateBMI(updateData.weight, updateData.height);
    }

    // Recheck flags
    updateData.flags = checkVitalFlags(updateData);
    updateData.updatedAt = new Date();

    // Update Firestore record
    const updatedVitals = await db.updateVitals(id, updateData);

    logger.info(`Vitals updated: ${id}`);

    res.json({
      status: "success",
      data: updatedVitals,
    });
  } catch (error: any) {
    logger.error("Update vitals error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getAbnormalFlags = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vitals = await db.getVitalsById(id);
    if (!vitals) {
      return res.status(404).json({
        status: "error",
        message: "Vitals record not found",
      });
    }

    res.json({
      status: "success",
      data: {
        flags: vitals.flags || [],
        critical: (vitals.flags || []).filter((f: string) =>
          f.startsWith("CRITICAL")
        ),
        warnings: (vitals.flags || []).filter((f: string) =>
          f.startsWith("WARNING")
        ),
      },
    });
  } catch (error: any) {
    logger.error("Get abnormal flags error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
