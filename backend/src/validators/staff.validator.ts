import { body } from "express-validator";

export const staffValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("role")
    .isIn(["DOCTOR", "NURSE", "CLERK", "CASHIER"])
    .withMessage("Invalid role"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
];
