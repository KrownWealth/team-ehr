import { body } from "express-validator";

export const consultationValidator = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),

  body("subjective")
    .trim()
    .notEmpty()
    .withMessage("Subjective assessment is required"),

  body("objective")
    .trim()
    .notEmpty()
    .withMessage("Objective assessment is required"),

  body("assessment").trim().notEmpty().withMessage("Assessment is required"),

  body("plan").trim().notEmpty().withMessage("Plan is required"),

  body("prescriptions")
    .optional()
    .isArray()
    .withMessage("Prescriptions must be an array"),

  body("labOrders")
    .optional()
    .isArray()
    .withMessage("Lab orders must be an array"),

  body("followUpDate")
    .optional()
    .isISO8601()
    .withMessage("Valid follow-up date is required"),
];
