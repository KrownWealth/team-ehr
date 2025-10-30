import { body } from "express-validator";

export const addToQueueValidator = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("priority")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Priority must be between 0 and 10"),
];

export const getQueueValidator = [
  body("status")
    .isIn(["WAITING", "IN_CONSULTATION", "COMPLETED"])
    .withMessage("Invalid status"),
];
