// backend/src/validators/patient-auth.validator.ts

import { body } from "express-validator";

export const patientRequestOTPValidator = [
  body("email")
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Valid phone number is required"),

  // Custom validator to ensure at least one is provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error("Email or phone number is required");
    }
    return true;
  }),
];

export const patientVerifyOTPValidator = [
  body("email")
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Valid phone number is required"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("OTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits")
    .isNumeric()
    .withMessage("OTP code must contain only numbers"),

  // Custom validator to ensure at least one identifier is provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error("Email or phone number is required");
    }
    return true;
  }),
];

export const patientResendOTPValidator = [
  body("email")
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Valid phone number is required"),

  // Custom validator to ensure at least one is provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error("Email or phone number is required");
    }
    return true;
  }),
];
