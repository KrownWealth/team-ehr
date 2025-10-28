import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AnalyticsService } from "../services/analytics.service";
import { calculateBMI, checkVitalFlags } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";

const analyticsService = new AnalyticsService();

export const recordVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, ...vitalsData } = req.body;
    const { user } = req;

    // Calculate BMI if weight and height provided
    let bmi = null;
    if (vitalsData.weight && vitalsData.height) {
      bmi = calculateBMI(vitalsData.weight, vitalsData.height);
    }

    // Check for abnormal values
    const flags = checkVitalFlags(vitalsData);

    const vitals = await prisma.vitals.create({
      data: {
        patientId,
        recordedById: user!.id,
        ...vitalsData,
        bmi,
        flags,
      },
      include: {
        patient: true,
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Record in BigQuery for analytics
    if (vitalsData.bloodPressure) {
      await analyticsService.recordVitalsTrend(patientId, vitalsData);
    }

    logger.info(`Vitals recorded for patient: ${patientId}`);

    res.status(201).json({
      status: "success",
      data: vitals,
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
    const { limit = 10 } = req.query;

    const vitals = await prisma.vitals.findMany({
      where: {
        patientId,
        patient: { clinicId },
      },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      include: {
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.json({
      status: "success",
      data: vitals,
    });
  } catch (error: any) {
    logger.error("Get patient vitals error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate BMI if needed
    if (updateData.weight && updateData.height) {
      updateData.bmi = calculateBMI(updateData.weight, updateData.height);
    }

    // Recheck flags
    updateData.flags = checkVitalFlags(updateData);

    const vitals = await prisma.vitals.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Vitals updated: ${id}`);

    res.json({
      status: "success",
      data: vitals,
    });
  } catch (error: any) {
    logger.error("Update vitals error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAbnormalFlags = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vitals = await prisma.vitals.findUnique({
      where: { id },
      select: { flags: true },
    });

    if (!vitals) {
      return res.status(404).json({
        status: "error",
        message: "Vitals record not found",
      });
    }

    res.json({
      status: "success",
      data: {
        flags: vitals.flags,
        critical: vitals.flags.filter((f: any) => f.startsWith("CRITICAL")),
        warnings: vitals.flags.filter((f: any) => f.startsWith("WARNING")),
      },
    });
  } catch (error: any) {
    logger.error("Get abnormal flags error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
