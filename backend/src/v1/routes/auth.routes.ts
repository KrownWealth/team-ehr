import { Router } from "express";
import {
  registerAdmin,
  register,
  verifyOtp,
  resendOtp,
  login,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
  logout,
  logoutAllDevices,
  patientVerifyOTP,
  patientRequestOTP,
  patientResendOTP,
} from "../../controllers/auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  changePasswordValidator,
  resendOtpValidator,
} from "../../validators/auth.validator";
import {
  patientRequestOTPValidator,
  patientResendOTPValidator,
  patientVerifyOTPValidator,
} from "../../validators/patient-auth.validator";

const router = Router();

// Public routes
router.post("/register-admin", registerValidator, validate, registerAdmin);
router.post("/register", registerValidator, validate, register);
router.post("/verify-otp", verifyOtpValidator, validate, verifyOtp);
router.post("/resend-otp", resendOtpValidator, validate, resendOtp);
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
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAllDevices);

router.post(
  "/patient/request-otp",
  patientRequestOTPValidator,
  validate,
  patientRequestOTP
);

router.post(
  "/patient/verify-otp",
  patientVerifyOTPValidator,
  validate,
  patientVerifyOTP
);

router.post(
  "/patient/resend-otp",
  patientResendOTPValidator,
  validate,
  patientResendOTP
);

export default router;
