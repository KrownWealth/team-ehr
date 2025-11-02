import { body } from "express-validator";

export const patientValidator = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),

  body("lastName").trim().notEmpty().withMessage("Last name is required"),

  body("gender")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Valid gender is required"),

  body("birthDate").isISO8601().withMessage("Valid birth date is required"),

  body("phone").trim().notEmpty().withMessage("Phone number is required"),

  body("email").optional().isEmail().withMessage("Valid email is required"),

  body("addressLine").trim().notEmpty().withMessage("Address is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("emergencyContact")
    .trim()
    .notEmpty()
    .withMessage("Emergency contact is required"),

  body("emergencyPhone")
    .trim()
    .notEmpty()
    .withMessage("Emergency phone is required"),

  body("emergencyRelation")
    .trim()
    .notEmpty()
    .withMessage("Emergency relation is required"),
];
