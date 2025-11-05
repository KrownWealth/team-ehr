import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../utils/logger.utils";
// import { safeVertexAi } from "../config/gcp";
import prisma from "../config/database";
import { Prisma } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

/**
 * Enhanced AI Diagnosis with patient history integration
 */
export const getDiagnosisSuggestions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId, symptoms, chiefComplaint } = req.body;
    const { clinicId } = req;

    // Fetch patient's medical history
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      include: {
        vitals: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            assessment: true,
            prescriptions: true,
            createdAt: true,
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    // Build comprehensive medical context
    const medicalContext = {
      demographics: {
        age:
          new Date().getFullYear() - new Date(patient.birthDate).getFullYear(),
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      },
      chronic_conditions: patient.chronicConditions,
      allergies: patient.allergies,
      recent_vitals: patient.vitals.map((v) => ({
        date: v.createdAt,
        bp: v.bloodPressure,
        temp: v.temperature,
        pulse: v.pulse,
        bmi: v.bmi,
        flags: v.flags,
      })),
      medical_history: patient.consultations.map((c) => ({
        date: c.createdAt,
        diagnosis: c.assessment,
      })),
    };

    // Construct AI prompt
    const prompt = `
You are a medical AI assistant helping with clinical decision support.

PATIENT CONTEXT:
- Age: ${medicalContext.demographics.age}, Gender: ${
      medicalContext.demographics.gender
    }
- Blood Group: ${medicalContext.demographics.bloodGroup || "Unknown"}
- Chronic Conditions: ${medicalContext.chronic_conditions.join(", ") || "None"}
- Allergies: ${medicalContext.allergies.join(", ") || "None"}

CURRENT PRESENTATION:
Chief Complaint: ${chiefComplaint}
Symptoms: ${symptoms}

RECENT VITAL SIGNS:
${JSON.stringify(medicalContext.recent_vitals, null, 2)}

MEDICAL HISTORY (Last 5 visits):
${JSON.stringify(medicalContext.medical_history, null, 2)}

Provide a structured clinical assessment with:
1. Top 3-5 differential diagnoses (most likely to least likely)
2. Recommended investigations/tests
3. Red flags to watch for
4. Suggested management approach

Format as JSON:
{
  "differential_diagnoses": [
    {
      "condition": "Name",
      "probability": "high/medium/low",
      "reasoning": "Brief explanation",
      "icd10_code": "Code if applicable"
    }
  ],
  "recommended_tests": ["Test 1", "Test 2"],
  "red_flags": ["Flag 1", "Flag 2"],
  "management_suggestions": ["Suggestion 1", "Suggestion 2"],
  "follow_up": "Recommended timeline"
}
`;

    const summaryCompletion = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const aiResponse =
      summaryCompletion.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Summary not available";

    logger.info(`AI diagnosis generated for patient: ${patientId}`);

    res.json({
      status: "success",
      data: {
        patient_context: medicalContext,
        ai_suggestions: aiResponse,
        disclaimer:
          "AI-generated suggestions are for clinical decision support only. Final diagnosis and treatment must be determined by qualified healthcare professionals.",
      },
    });
  } catch (error: any) {
    logger.error("AI diagnosis error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate diagnosis suggestions",
    });
  }
};

/**
 * Drug Interaction Checker
 */
export const checkDrugInteractions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { patientId, proposedMedications } = req.body;
    const { clinicId } = req;

    // Fetch patient's current medications
    const recentConsultations = await prisma.consultation.findMany({
      where: {
        patientId,
        clinicId,
        prescriptions: { not: Prisma.JsonNull },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Extract current medications
    const currentMedications: string[] = [];
    recentConsultations.forEach((consultation) => {
      const prescriptions = consultation.prescriptions as any[];
      if (Array.isArray(prescriptions)) {
        prescriptions.forEach((rx) => {
          if (rx.drug) currentMedications.push(rx.drug);
        });
      }
    });

    // Check interactions
    const interactions = checkCommonInteractions(
      currentMedications,
      proposedMedications
    );

    res.json({
      status: "success",
      data: {
        current_medications: currentMedications,
        proposed_medications: proposedMedications,
        interactions: interactions,
        safe_to_prescribe:
          interactions.filter((i) => i.severity === "major").length === 0,
      },
    });
  } catch (error: any) {
    logger.error("Drug interaction check error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Vital Signs Trend Analysis
 */
export const analyzeVitalsTrends = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;
    const { days = 30 } = req.query;

    const vitals = await prisma.vitals.findMany({
      where: {
        patientId,
        patient: { clinicId },
        createdAt: {
          gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (vitals.length === 0) {
      return res.json({
        status: "success",
        data: {
          message: "No vitals data available for analysis",
          trends: [],
        },
      });
    }

    // Analyze trends
    const trends = analyzeVitalsData(vitals);

    res.json({
      status: "success",
      data: {
        period_days: days,
        readings_count: vitals.length,
        trends: trends,
        latest_reading: vitals[vitals.length - 1],
      },
    });
  } catch (error: any) {
    logger.error("Vitals trend analysis error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Clinical Decision Support - Risk Assessment
 */
export const assessPatientRisk = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      include: {
        vitals: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    // Calculate risk scores
    const riskAssessment = {
      cardiovascular_risk: calculateCardiovascularRisk(patient),
      diabetes_risk: calculateDiabetesRisk(patient),
      general_health_score: calculateGeneralHealthScore(patient),
      recommendations: generateHealthRecommendations(patient),
    };

    res.json({
      status: "success",
      data: riskAssessment,
    });
  } catch (error: any) {
    logger.error("Risk assessment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Helper functions
function checkCommonInteractions(
  currentMeds: string[],
  proposedMeds: string[]
) {
  // Simplified interaction database (expand with real data)
  const knownInteractions = [
    {
      drug1: "warfarin",
      drug2: "aspirin",
      severity: "major",
      description: "Increased bleeding risk",
    },
    {
      drug1: "metformin",
      drug2: "alcohol",
      severity: "moderate",
      description: "Risk of lactic acidosis",
    },
    // Add more interactions
  ];

  const interactions: any[] = [];
  currentMeds.forEach((current) => {
    proposedMeds.forEach((proposed) => {
      knownInteractions.forEach((interaction) => {
        if (
          (current.toLowerCase().includes(interaction.drug1) &&
            proposed.toLowerCase().includes(interaction.drug2)) ||
          (current.toLowerCase().includes(interaction.drug2) &&
            proposed.toLowerCase().includes(interaction.drug1))
        ) {
          interactions.push({
            ...interaction,
            current_medication: current,
            proposed_medication: proposed,
          });
        }
      });
    });
  });

  return interactions;
}

function analyzeVitalsData(vitals: any[]) {
  const trends: any = {
    blood_pressure: { status: "stable", trend: "normal" },
    temperature: { status: "stable", trend: "normal" },
    weight: { status: "stable", trend: "normal" },
    bmi: { status: "stable", trend: "normal" },
  };

  // Analyze BP trend
  const bpReadings = vitals
    .filter((v) => v.bloodPressure)
    .map((v) => {
      const [sys] = v.bloodPressure.split("/").map(Number);
      return sys;
    });

  if (bpReadings.length >= 3) {
    const avgFirst =
      bpReadings
        .slice(0, Math.floor(bpReadings.length / 2))
        .reduce((a, b) => a + b, 0) / Math.floor(bpReadings.length / 2);
    const avgLast =
      bpReadings
        .slice(Math.floor(bpReadings.length / 2))
        .reduce((a, b) => a + b, 0) /
      (bpReadings.length - Math.floor(bpReadings.length / 2));

    const change = ((avgLast - avgFirst) / avgFirst) * 100;
    trends.blood_pressure.trend =
      change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable";
    trends.blood_pressure.change_percent = change.toFixed(1);
  }

  // Similar analysis for other vitals...
  return trends;
}

function calculateCardiovascularRisk(patient: any) {
  let riskScore = 0;
  const age =
    new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  // Age factor
  if (age > 65) riskScore += 3;
  else if (age > 50) riskScore += 2;
  else if (age > 40) riskScore += 1;

  // Chronic conditions
  if (
    patient.chronicConditions.some(
      (c: string) =>
        c.toLowerCase().includes("hypertension") ||
        c.toLowerCase().includes("diabetes")
    )
  ) {
    riskScore += 3;
  }

  // Latest vitals
  const latestVital = patient.vitals[0];
  if (latestVital?.bloodPressure) {
    const [sys] = latestVital.bloodPressure.split("/").map(Number);
    if (sys >= 140) riskScore += 2;
  }

  if (latestVital?.bmi && latestVital.bmi > 30) riskScore += 2;

  return {
    score: riskScore,
    level: riskScore >= 7 ? "high" : riskScore >= 4 ? "moderate" : "low",
    factors:
      riskScore >= 7
        ? ["Age", "Chronic conditions", "High BP or BMI"]
        : riskScore >= 4
        ? ["Some risk factors present"]
        : ["Low risk"],
  };
}

function calculateDiabetesRisk(patient: any) {
  let riskScore = 0;

  // Check for diabetes in chronic conditions
  if (
    patient.chronicConditions.some((c: string) =>
      c.toLowerCase().includes("diabetes")
    )
  ) {
    return { score: 10, level: "diagnosed", note: "Patient has diabetes" };
  }

  // BMI factor
  const latestVital = patient.vitals[0];
  if (latestVital?.bmi) {
    if (latestVital.bmi >= 30) riskScore += 3;
    else if (latestVital.bmi >= 25) riskScore += 2;
  }

  // Blood glucose if available
  if (latestVital?.bloodGlucose) {
    if (latestVital.bloodGlucose >= 126) riskScore += 4;
    else if (latestVital.bloodGlucose >= 100) riskScore += 2;
  }

  return {
    score: riskScore,
    level: riskScore >= 6 ? "high" : riskScore >= 3 ? "moderate" : "low",
  };
}

function calculateGeneralHealthScore(patient: any) {
  // 0-100 score based on various factors
  let score = 100;

  // Deduct for chronic conditions
  score -= patient.chronicConditions.length * 10;

  // Deduct for abnormal vitals
  const latestVital = patient.vitals[0];
  if (latestVital?.flags && latestVital.flags.length > 0) {
    score -=
      latestVital.flags.filter((f: string) => f.includes("CRITICAL")).length *
      15;
    score -=
      latestVital.flags.filter((f: string) => f.includes("WARNING")).length * 5;
  }

  return Math.max(0, Math.min(100, score));
}

function generateHealthRecommendations(patient: any) {
  const recommendations: string[] = [];

  const latestVital = patient.vitals[0];

  if (latestVital?.bmi && latestVital.bmi > 25) {
    recommendations.push("Weight management program recommended");
  }

  if (latestVital?.bloodPressure) {
    const [sys] = latestVital.bloodPressure.split("/").map(Number);
    if (sys >= 140) {
      recommendations.push("Blood pressure monitoring and management needed");
    }
  }

  if (patient.chronicConditions.length > 0) {
    recommendations.push("Regular follow-up for chronic condition management");
  }

  if (recommendations.length === 0) {
    recommendations.push("Maintain current healthy lifestyle");
    recommendations.push("Regular health check-ups recommended");
  }

  return recommendations;
}
