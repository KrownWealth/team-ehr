import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../utils/logger.utils";
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
} from "../utils/response.utils";

export const getSystemRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = [
      {
        name: "ADMIN",
        description: "Full system access, clinic management",
        permissions: [
          "manage_clinic",
          "manage_staff",
          "view_all_reports",
          "manage_billing",
        ],
      },
      {
        name: "DOCTOR",
        description: "Clinical consultations, prescriptions",
        permissions: [
          "view_patients",
          "create_consultation",
          "prescribe_medication",
          "order_labs",
          "view_reports",
        ],
      },
      {
        name: "NURSE",
        description: "Patient vitals, triage, basic care",
        permissions: [
          "view_patients",
          "record_vitals",
          "manage_queue",
          "assist_consultation",
        ],
      },
      {
        name: "CLERK",
        description: "Patient registration, appointments",
        permissions: [
          "register_patient",
          "manage_appointments",
          "manage_queue",
          "view_patients",
        ],
      },
      {
        name: "CASHIER",
        description: "Billing and payments",
        permissions: [
          "create_bill",
          "record_payment",
          "view_billing",
          "generate_receipts",
        ],
      },
    ];

    return successResponse(res, roles, "System roles retrieved successfully");
  } catch (error: any) {
    logger.error("Get system roles error:", error);
    return serverErrorResponse(res, "Failed to retrieve system roles", error);
  }
};

export const getICD10Codes = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category } = req.query;

    let codes = [
      { code: "A00", description: "Cholera", category: "Infectious diseases" },
      {
        code: "A09",
        description: "Diarrhoea and gastroenteritis",
        category: "Infectious diseases",
      },
      {
        code: "B54",
        description: "Malaria, unspecified",
        category: "Infectious diseases",
      },
      {
        code: "E11",
        description: "Type 2 diabetes mellitus",
        category: "Endocrine",
      },
      {
        code: "I10",
        description: "Essential (primary) hypertension",
        category: "Circulatory",
      },
      {
        code: "J00",
        description: "Acute nasopharyngitis (common cold)",
        category: "Respiratory",
      },
      {
        code: "J06",
        description: "Acute upper respiratory infections",
        category: "Respiratory",
      },
      {
        code: "J18",
        description: "Pneumonia, unspecified",
        category: "Respiratory",
      },
      {
        code: "K29",
        description: "Gastritis and duodenitis",
        category: "Digestive",
      },
      {
        code: "M79",
        description: "Other soft tissue disorders",
        category: "Musculoskeletal",
      },
      {
        code: "R50",
        description: "Fever of unknown origin",
        category: "Symptoms",
      },
      { code: "R51", description: "Headache", category: "Symptoms" },
      {
        code: "Z00",
        description: "General examination and investigation",
        category: "Factors influencing health",
      },
    ];

    // Filter by search term
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      codes = codes.filter(
        (code) =>
          code.code.toLowerCase().includes(searchTerm) ||
          code.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (category) {
      codes = codes.filter((code) => code.category === category);
    }

    return successResponse(
      res,
      {
        codes,
        total: codes.length,
        note: "Sample data - integrate with WHO ICD-10 API in production",
      },
      "ICD-10 codes retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get ICD-10 codes error:", error);
    return serverErrorResponse(res, "Failed to retrieve ICD-10 codes", error);
  }
};

export const getDrugLibrary = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category } = req.query;

    let drugs = [
      {
        name: "Paracetamol",
        genericName: "Acetaminophen",
        category: "Analgesic/Antipyretic",
        commonDosages: ["500mg", "1000mg"],
        route: "Oral",
        cautions: ["Liver disease", "Alcohol use"],
      },
      {
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        category: "Antibiotic",
        commonDosages: ["250mg", "500mg"],
        route: "Oral",
        cautions: ["Penicillin allergy", "Renal impairment"],
      },
      {
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        category: "NSAID",
        commonDosages: ["200mg", "400mg", "600mg"],
        route: "Oral",
        cautions: ["GI bleeding", "Renal disease", "Asthma"],
      },
      {
        name: "Metformin",
        genericName: "Metformin",
        category: "Antidiabetic",
        commonDosages: ["500mg", "850mg", "1000mg"],
        route: "Oral",
        cautions: ["Renal impairment", "Heart failure"],
      },
      {
        name: "Amlodipine",
        genericName: "Amlodipine",
        category: "Antihypertensive",
        commonDosages: ["5mg", "10mg"],
        route: "Oral",
        cautions: ["Hypotension", "Heart failure"],
      },
      {
        name: "Omeprazole",
        genericName: "Omeprazole",
        category: "Proton Pump Inhibitor",
        commonDosages: ["20mg", "40mg"],
        route: "Oral",
        cautions: ["Long-term use risks", "C. difficile infection"],
      },
    ];

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      drugs = drugs.filter(
        (drug) =>
          drug.name.toLowerCase().includes(searchTerm) ||
          drug.genericName.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      drugs = drugs.filter((drug) => drug.category === category);
    }

    return successResponse(
      res,
      {
        drugs,
        total: drugs.length,
        note: "Sample data - integrate with comprehensive drug database in production",
      },
      "Drug library retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get drug library error:", error);
    return serverErrorResponse(res, "Failed to retrieve drug library", error);
  }
};

export const getReferenceRanges = async (req: AuthRequest, res: Response) => {
  try {
    const { testCode } = req.query;

    const referenceRanges = {
      CBC: {
        test: "Complete Blood Count",
        parameters: [
          {
            name: "WBC",
            unit: "x10^9/L",
            normalRange: { min: 4.0, max: 11.0 },
          },
          {
            name: "RBC",
            unit: "x10^12/L",
            normalRange: {
              male: { min: 4.5, max: 6.0 },
              female: { min: 4.0, max: 5.5 },
            },
          },
          {
            name: "Hemoglobin",
            unit: "g/dL",
            normalRange: {
              male: { min: 13.5, max: 17.5 },
              female: { min: 12.0, max: 16.0 },
            },
          },
          {
            name: "Platelets",
            unit: "x10^9/L",
            normalRange: { min: 150, max: 400 },
          },
        ],
      },
      FBS: {
        test: "Fasting Blood Sugar",
        parameters: [
          {
            name: "Glucose",
            unit: "mg/dL",
            normalRange: { min: 70, max: 100 },
            prediabetes: { min: 100, max: 125 },
            diabetes: { min: 126 },
          },
        ],
      },
      LFT: {
        test: "Liver Function Test",
        parameters: [
          { name: "ALT", unit: "U/L", normalRange: { min: 7, max: 56 } },
          { name: "AST", unit: "U/L", normalRange: { min: 10, max: 40 } },
          { name: "ALP", unit: "U/L", normalRange: { min: 44, max: 147 } },
          {
            name: "Total Bilirubin",
            unit: "mg/dL",
            normalRange: { min: 0.1, max: 1.2 },
          },
        ],
      },
      RFT: {
        test: "Renal Function Test",
        parameters: [
          {
            name: "Creatinine",
            unit: "mg/dL",
            normalRange: {
              male: { min: 0.7, max: 1.3 },
              female: { min: 0.6, max: 1.1 },
            },
          },
          { name: "Urea", unit: "mg/dL", normalRange: { min: 7, max: 20 } },
        ],
      },
    };

    if (testCode) {
      const range = (referenceRanges as any)[testCode as string];
      if (!range) {
        return notFoundResponse(res, "Test code not found");
      }

      return successResponse(
        res,
        range,
        `Reference ranges for ${testCode} retrieved successfully`
      );
    }

    return successResponse(
      res,
      referenceRanges,
      "Lab reference ranges retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get reference ranges error:", error);
    return serverErrorResponse(
      res,
      "Failed to retrieve reference ranges",
      error
    );
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { startDate, endDate, userId, action, limit = 50 } = req.query;

    return successResponse(
      res,
      {
        logs: [],
        message: "Audit logging not yet implemented",
        note: "In production, implement with dedicated audit_logs table tracking all CRUD operations",
        recommendedFields: [
          "id",
          "clinicId",
          "userId",
          "action",
          "entity",
          "entityId",
          "changes",
          "ipAddress",
          "userAgent",
          "timestamp",
        ],
      },
      "Audit logs feature coming soon"
    );
  } catch (error: any) {
    logger.error("Get audit logs error:", error);
    return serverErrorResponse(res, "Failed to retrieve audit logs", error);
  }
};
