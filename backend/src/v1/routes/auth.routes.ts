import { Router } from "express";
import {
  register,
  verifyOtp,
  login,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
} from "../../controllers/auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  changePasswordValidator,
} from "../../validators/auth.validator";

const router = Router();

// Public routes
router.post("/register", registerValidator, validate, register);
router.post("/verify-otp", verifyOtpValidator, validate, verifyOtp);
router.post("/login", loginValidator, validate, login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Protected routes
router.post(
  "/change-password",
  authenticate,
  changePasswordValidator,
  validate,
  changePassword
);

export default router;
