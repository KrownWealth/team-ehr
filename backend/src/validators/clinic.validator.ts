import { body } from "express-validator";

export const clinicValidator = [
  body("name").trim().notEmpty().withMessage("Clinic name is required"),

  body("type").trim().notEmpty().withMessage("Clinic type is required"),

  body("address").trim().notEmpty().withMessage("Address is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("lga").trim().notEmpty().withMessage("LGA is required"),

  body("phone").trim().notEmpty().withMessage("Phone number is required"),

  body("email").trim().isEmail().withMessage("Valid email is required"),
];
