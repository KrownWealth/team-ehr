import { body } from "express-validator";

export const appointmentValidator = [
  body("patientId")
    .trim()
    .notEmpty()
    .withMessage("Patient ID is required")
    .isString()
    .withMessage("Patient ID must be a string"),

  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Valid appointment date is required (ISO 8601 format)")
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();

      // Allow scheduling appointments up to 1 year in advance
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (appointmentDate < now) {
        throw new Error("Appointment date cannot be in the past");
      }

      if (appointmentDate > oneYearFromNow) {
        throw new Error(
          "Appointment date cannot be more than 1 year in advance"
        );
      }

      return true;
    }),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason must not exceed 500 characters"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),

  body("status")
    .optional()
    .isIn([
      "SCHEDULED",
      "CHECKED_IN",
      "IN_CONSULTATION",
      "COMPLETED",
      "CANCELLED",
    ])
    .withMessage("Invalid appointment status"),
];
