import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../utils/logger.utils";
import { vertexai } from "../config/gcp";

import db from "../services/database.service";

export const getDiagnosisSuggestions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { symptoms, vitals, patientHistory } = req.body;

    if (!vertexai) {
      return res
        .status(500)
        .json({ status: "error", message: "Vertex AI not configured" });
    }

    const prompt = `
      You are a medical AI assistant.
      Given the following patient data, provide possible diagnoses and recommendations.
      Symptoms: ${symptoms}
      Vitals: ${JSON.stringify(vitals)}
      Patient History: ${JSON.stringify(patientHistory)}
      Provide your response as JSON with "diagnoses" and "recommendations" fields.
    `;

    const model = vertexai?.getGenerativeModel({ model: "gemini-3.5-flash" });

    if (!model) {
      return res
        .status(500)
        .json({ status: "error", message: "Vertex AI not initialized" });
    }

    const result = await model.generateContent(prompt);
    const suggestions =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No suggestions";

    res.json({
      status: "success",
      data: suggestions,
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
    const { patientId, drugs } = req.body;
    const { clinicId } = req;

    const patient = await db.getPatient(patientId, clinicId!);
    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
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
    logger.error("Check drug allergies error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const analyzeVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { vitals } = req.body;

    const analysis = {
      alerts: [] as any[],
      warnings: [] as any[],
      normal: [] as string[],
    };

    // Blood Pressure Analysis
    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split("/").map(Number);
      if (systolic >= 180 || diastolic >= 120) {
        analysis.alerts.push({
          type: "CRITICAL",
          parameter: "Blood Pressure",
          value: vitals.bloodPressure,
          message: "Hypertensive crisis - immediate attention required",
        });
      } else if (systolic >= 140 || diastolic >= 90) {
        analysis.warnings.push({
          type: "WARNING",
          parameter: "Blood Pressure",
          value: vitals.bloodPressure,
          message: "Elevated blood pressure - monitor closely",
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
          value: `${vitals.temperature}°C`,
          message: "High fever - antipyretics and monitoring required",
        });
      } else if (vitals.temperature >= 38) {
        analysis.warnings.push({
          type: "WARNING",
          parameter: "Temperature",
          value: `${vitals.temperature}°C`,
          message: "Fever present - consider cause and treatment",
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
          value: `${vitals.spo2}%`,
          message: "Severe hypoxia - oxygen therapy required",
        });
      } else if (vitals.spo2 < 95) {
        analysis.warnings.push({
          type: "WARNING",
          parameter: "SpO2",
          value: `${vitals.spo2}%`,
          message: "Low oxygen saturation - assess respiratory status",
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
    res.status(500).json({ status: "error", message: error.message });
  }
};
