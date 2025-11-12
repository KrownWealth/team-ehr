// backend/src/controllers/vital.controller.ts (UPDATED WITH ALERTS)

import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { calculateBMI, checkVitalFlags } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";
import {
  createdResponse,
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from "../utils/response.utils";

/**
 * Record patient vitals
 * Returns vitals data with critical alerts
 */
export const recordVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, ...vitalsData } = req.body;
    const { user, clinicId } = req;

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        patientNumber: true,
      },
    });

    if (!patient) {
      return notFoundResponse(res, "Patient not found in this clinic");
    }

    // Calculate BMI if weight and height provided
    let bmi = 0;
    if (vitalsData.weight && vitalsData.height) {
      bmi = calculateBMI(vitalsData.weight, vitalsData.height);
    }

    // Check for abnormal values and generate flags
    const flags = checkVitalFlags({ ...vitalsData, bmi });

    // Create vitals record
    const vitals = await prisma.vitals.create({
      data: {
        patientId,
        recordedById: user!.id,
        ...vitalsData,
        bmi,
        flags,
      },
      include: {
        patient: {
          select: {
            patientNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Separate critical and warning alerts
    const criticalAlerts = flags.filter((f: string) =>
      f.startsWith("CRITICAL")
    );
    const warningAlerts = flags.filter((f: string) => f.startsWith("WARNING"));

    // Log critical vitals for immediate attention
    if (criticalAlerts.length > 0) {
      logger.warn(
        `CRITICAL VITALS: Patient ${patient.patientNumber} (${
          patient.firstName
        } ${patient.lastName}) - ${criticalAlerts.join(", ")}`
      );
    }

    logger.info(`Vitals recorded for patient: ${patientId}`);

    // Return response with alerts as metadata
    return createdResponse(res, vitals, "Vitals recorded successfully", {
      alerts: {
        critical: criticalAlerts,
        warnings: warningAlerts,
        hasCritical: criticalAlerts.length > 0,
        hasWarnings: warningAlerts.length > 0,
        totalAlerts: flags.length,
      },
    });
  } catch (error: any) {
    logger.error("Record vitals error:", error);
    return serverErrorResponse(res, "Failed to record vitals", error);
  }
};

/**
 * Get patient vitals history
 */
export const getPatientVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;
    const { limit = 10, page = 1 } = req.query;

    // Verify patient exists
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: { id: true, patientNumber: true },
    });

    if (!patient) {
      return notFoundResponse(res, "Patient");
    }

    // Get vitals with pagination
    const [vitals, total] = await Promise.all([
      prisma.vitals.findMany({
        where: {
          patientId,
          patient: { clinicId },
        },
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
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
      }),
      prisma.vitals.count({
        where: {
          patientId,
          patient: { clinicId },
        },
      }),
    ]);

    // Calculate vitals summary
    const latestVital = vitals[0];
    const hasCriticalFlags = latestVital?.flags?.some((f: string) =>
      f.startsWith("CRITICAL")
    );

    return successResponse(
      res,
      {
        vitals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Vitals retrieved successfully"
      // {
      //   summary: {
      //     totalRecords: total,
      //     latestRecordDate: latestVital?.createdAt,
      //     hasCriticalFlags,
      //   },
      // }
    );
  } catch (error: any) {
    logger.error("Get patient vitals error:", error);
    return serverErrorResponse(res, "Failed to retrieve vitals", error);
  }
};

/**
 * Update vitals record
 */
export const updateVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;
    const updateData = req.body;

    // Check if vitals record exists and belongs to clinic
    const existingVitals = await prisma.vitals.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
    });

    if (!existingVitals) {
      return notFoundResponse(res, "Vitals record");
    }

    // Recalculate BMI if weight or height changed
    if (updateData.weight || updateData.height) {
      const weight = updateData.weight || existingVitals.weight;
      const height = updateData.height || existingVitals.height;

      if (weight && height) {
        updateData.bmi = calculateBMI(weight, height);
      }
    }

    // Recheck flags with updated data
    const mergedData = { ...existingVitals, ...updateData };
    updateData.flags = checkVitalFlags(mergedData);

    // Update vitals
    const vitals = await prisma.vitals.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            patientNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Check for new critical alerts
    const criticalAlerts = updateData.flags.filter((f: string) =>
      f.startsWith("CRITICAL")
    );

    if (criticalAlerts.length > 0) {
      logger.warn(
        `Updated vitals contain CRITICAL flags for patient ${
          vitals.patient.patientNumber
        }: ${criticalAlerts.join(", ")}`
      );
    }

    logger.info(`Vitals updated: ${id}`);

    return successResponse(
      res,
      vitals,
      "Vitals updated successfully"
      //   alerts: {
      //     critical: criticalAlerts,
      //     warnings: updateData.flags.filter((f: string) =>
      //       f.startsWith("WARNING")
      //     ),
      //     hasCritical: criticalAlerts.length > 0,
      //   },
      // }
    );
  } catch (error: any) {
    logger.error("Update vitals error:", error);
    return serverErrorResponse(res, "Failed to update vitals", error);
  }
};

/**
 * Get abnormal vital flags for a specific record
 */
export const getAbnormalFlags = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const vitals = await prisma.vitals.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
      select: {
        flags: true,
        bloodPressure: true,
        temperature: true,
        pulse: true,
        spo2: true,
        bloodGlucose: true,
        createdAt: true,
        patient: {
          select: {
            patientNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!vitals) {
      return notFoundResponse(res, "Vitals record");
    }

    // Categorize flags
    const critical = vitals.flags.filter((f: string) =>
      f.startsWith("CRITICAL")
    );
    const warnings = vitals.flags.filter((f: string) =>
      f.startsWith("WARNING")
    );

    // Create detailed flag descriptions
    const flagDescriptions = vitals.flags.map((flag: string) => ({
      flag,
      severity: flag.startsWith("CRITICAL") ? "critical" : "warning",
      description: getFlagDescription(flag),
      parameter: getFlagParameter(flag),
    }));

    return successResponse(
      res,
      {
        vitalId: id,
        patientInfo: vitals.patient,
        recordDate: vitals.createdAt,
        flags: vitals.flags,
        categorized: {
          critical,
          warnings,
          normal: vitals.flags.length === 0,
        },
        details: flagDescriptions,
        vitalValues: {
          bloodPressure: vitals.bloodPressure,
          temperature: vitals.temperature,
          pulse: vitals.pulse,
          spo2: vitals.spo2,
          bloodGlucose: vitals.bloodGlucose,
        },
      },
      "Vital flags retrieved successfully"
      // {
      //   requiresAttention: critical.length > 0,
      //   alertCount: vitals.flags.length,
      // }
    );
  } catch (error: any) {
    logger.error("Get abnormal flags error:", error);
    return serverErrorResponse(res, "Failed to retrieve vital flags", error);
  }
};

function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    CRITICAL_BP_HIGH:
      "Critically high blood pressure - immediate medical attention required",
    WARNING_BP_HIGH: "Elevated blood pressure - monitoring recommended",
    WARNING_BP_LOW: "Low blood pressure - patient may feel dizzy",
    CRITICAL_TEMP_HIGH: "Critically high temperature - fever management needed",
    WARNING_TEMP_HIGH: "Elevated temperature - monitor for fever",
    CRITICAL_TEMP_LOW: "Dangerously low temperature - hypothermia risk",
    CRITICAL_SPO2_LOW:
      "Critically low oxygen saturation - oxygen therapy may be needed",
    WARNING_SPO2_LOW:
      "Low oxygen saturation - respiratory assessment recommended",
    WARNING_PULSE_ABNORMAL:
      "Abnormal heart rate - cardiac assessment recommended",
    WARNING_GLUCOSE_HIGH: "High blood glucose - diabetes management needed",
    WARNING_GLUCOSE_LOW: "Low blood glucose - hypoglycemia risk",
  };

  return descriptions[flag] || "Abnormal vital sign detected";
}

/**
 * Helper function to extract parameter from flag
 */
function getFlagParameter(flag: string): string {
  if (flag.includes("BP")) return "Blood Pressure";
  if (flag.includes("TEMP")) return "Temperature";
  if (flag.includes("SPO2")) return "Oxygen Saturation";
  if (flag.includes("PULSE")) return "Heart Rate";
  if (flag.includes("GLUCOSE")) return "Blood Glucose";
  return "Unknown";
}
