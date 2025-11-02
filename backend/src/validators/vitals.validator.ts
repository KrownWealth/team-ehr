import { body } from "express-validator";

export const vitalsValidator = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),

  body("temperature")
    .optional()
    .isFloat({ min: 30, max: 45 })
    .withMessage("Temperature must be between 30 and 45"),

  body("pulse")
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage("Pulse must be between 30 and 200"),

  body("respiration")
    .optional()
    .isInt({ min: 5, max: 60 })
    .withMessage("Respiration must be between 5 and 60"),

  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number"),

  body("height")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Height must be a positive number"),

  body("spo2")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("SpO2 must be between 0 and 100"),

  body("bloodGlucose")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Blood glucose must be a positive number"),
];
