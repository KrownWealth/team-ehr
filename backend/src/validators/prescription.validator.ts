import { body } from "express-validator";

export const createPrescriptionValidator = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("prescriptions")
    .isArray({ min: 1 })
    .withMessage("At least one prescription is required"),
  body("prescriptions.*.drug").notEmpty().withMessage("Drug name is required"),
  body("prescriptions.*.dosage").notEmpty().withMessage("Dosage is required"),
  body("prescriptions.*.frequency")
    .notEmpty()
    .withMessage("Frequency is required"),
];

export const updatePrescriptionValidator = [
  body("prescriptions")
    .isArray({ min: 1 })
    .withMessage("At least one prescription is required"),
];

export const checkAllergiesValidator = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("drugs").isArray({ min: 1 }).withMessage("Drugs array is required"),
];
