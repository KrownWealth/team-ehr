import { Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/database";
import { config } from "../config/env";
import logger from "../utils/logger.utils";

export const getDiagnosisSuggestions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { symptoms, vitals, patientHistory } = req.body;

    // Call Cloud Function for AI diagnosis
    const response = await axios.post(config.externalApis.aiDiagnosisUrl!, {
      symptoms,
      vitals,
      patientHistory,
    });

    res.json({
      status: "success",
      data: response.data.suggestions,
    });
  } catch (error: any) {
    logger.error("AI diagnosis error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get diagnosis suggestions",
    });
  }
};

export const checkDrugAllergies = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, prescriptions } = req.body;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { allergies: true },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    const conflicts = prescriptions.filter((prescription: any) => {
      return patient.allergies?.some((allergy: string) =>
        prescription.drug.toLowerCase().includes(allergy.toLowerCase())
      );
    });

    res.json({
      status: "success",
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
        allergies: patient.allergies,
      },
    });
  } catch (error: any) {
    logger.error("Check drug allergies error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const analyzeVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { vitals } = req.body;

    const analysis: any = {
      alerts: [],
      warnings: [],
      normal: [],
    };

    // Blood Pressure Analysis
    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split("/").map(Number);
      if (systolic >= 180 || diastolic >= 120) {
        analysis.alerts.push({
          type: "CRITICAL",
          parameter: "Blood Pressure",
          value: vitals.bloodPressure,
          message: "Hypertensive Crisis - Immediate attention required",
        });
      } else if (systolic >= 140 || diastolic >= 90) {
        analysis.warnings.push({
          type: "WARNING",
          parameter: "Blood Pressure",
          value: vitals.bloodPressure,
          message: "Elevated blood pressure - Monitor closely",
        });
      } else {
        analysis.normal.push("Blood Pressure");
      }
    }

    // Temperature Analysis
    if (vitals.temperature) {
      if (vitals.temperature >= 39.5) {
        analysis.alerts.push({
          type: "CRITICAL",
          parameter: "Temperature",
          value: vitals.temperature,
          message: "High fever - Immediate intervention needed",
        });
      } else if (vitals.temperature >= 38) {
        analysis.warnings.push({
          type: "WARNING",
          parameter: "Temperature",
          value: vitals.temperature,
          message: "Elevated temperature - Monitor",
        });
      } else if (vitals.temperature < 35) {
        analysis.alerts.push({
          type: "CRITICAL",
          parameter: "Temperature",
          value: vitals.temperature,
          message: "Hypothermia - Immediate attention required",
        });
      } else {
        analysis.normal.push("Temperature");
      }
    }

    // SpO2 Analysis
    if (vitals.spo2) {
      if (vitals.spo2 < 90) {
        analysis.alerts.push({
          type: "CRITICAL",
          parameter: "SpO2",
          value: vitals.spo2,
          message: "Severe hypoxemia - Oxygen therapy required",
        });
      } else if (vitals.spo2 < 95) {
        analysis.warnings.push({
          type: "WARNING",
          parameter: "SpO2",
          value: vitals.spo2,
          message: "Low oxygen saturation - Monitor closely",
        });
      } else {
        analysis.normal.push("SpO2");
      }
    }

    res.json({
      status: "success",
      data: analysis,
    });
  } catch (error: any) {
    logger.error("Analyze vitals error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
