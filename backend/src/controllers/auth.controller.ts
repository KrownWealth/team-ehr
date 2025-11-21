import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/database";
import { EmailService } from "../services/email.service";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";
import { generateOTP } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";

const emailService = new EmailService();

/**
 * Helper function to create and send OTP
 */
async function createAndSendOTP(email: string) {
  // Delete any existing unverified OTPs for this email
  await prisma.oTP.deleteMany({
    where: {
      email: email,
      verified: false,
    },
  });

  const otpCode = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const otpString = String(otpCode);

  await prisma.oTP.create({
    data: {
      email: email,
      code: otpString,
      expiresAt: otpExpiry,
    },
  });

  await emailService.sendOTPEmail(email, otpString);

  console.log(`[OTP] Created for ${email}: ${otpString}`);
}

/**
 * Register Admin User (First-time clinic setup)
 */
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: "ADMIN",
        clinicId: null,
        isVerified: false,
        onboardingStatus: "PENDING",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    await createAndSendOTP(email);

    logger.info(`Admin registered: ${email}`);

    res.status(201).json({
      status: "success",
      message: "Registration successful. Please verify your email.",
      data: user,
    });
  } catch (error: any) {
    logger.error("Register admin error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Register Regular User (Staff) - UPDATED TO ASSIGN CLINIC ID
 */
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role, clinicId } =
      req.body;

    if (!clinicId) {
      return res.status(400).json({
        status: "error",
        message: "Staff registration requires an associated clinic.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: role || "CLERK",
        isVerified: false,
        clinicId: clinicId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clinicId: true, // Include clinicId in the response
      },
    });

    await createAndSendOTP(email);

    logger.info(`Staff registered: ${email} for Clinic ID: ${clinicId}`);

    res.status(201).json({
      status: "success",
      message: "Registration successful. Please verify staff email.",
      data: { id: user.id, email: user.email, clinicId: user.clinicId },
    });
  } catch (error: any) {
    logger.error("Staff registration error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: "error",
        message: "Email is already verified",
      });
    }

    await createAndSendOTP(email);

    logger.info(`OTP resent to: ${email}`);

    res.json({
      status: "success",
      message: "OTP has been resent to your email",
    });
  } catch (error: any) {
    logger.error("Resend OTP error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        status: "error",
        message: "Email and code are required",
      });
    }

    const normalizedEmail = email;
    const normalizedCode = String(code).trim();

    console.log(
      `[OTP] Verification attempt - Email: ${normalizedEmail}, Code: ${normalizedCode}`
    );

    console.log(await prisma.oTP.findMany());

    const otp = await prisma.oTP.findFirst({
      where: {
        email: normalizedEmail,
        code: normalizedCode,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    console.log(`[OTP] Found OTP: ${otp ? "YES" : "NO"}`);

    if (!otp) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired OTP",
      });
    }

    await prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { isVerified: true },
    });

    console.log(`[OTP] ✅ Verification successful for: ${normalizedEmail}`);
    logger.info(`OTP verified for: ${email}`);

    res.json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error(`[OTP] ❌ Error:`, error);
    logger.error("Verify OTP error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log(user, email, password);

    if (!user || !user.password) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email first",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: "error",
        message: "Account is deactivated",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User logged in: ${email}`);

    res.json({
      status: "success",
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          clinicId: user.clinicId,
          mustChangePassword: user.mustChangePassword,
          onboardingStatus: user.onboardingStatus,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isActive: user.isActive,
          phone: user.phone,
          photoUrl: user.photoUrl,
        },
      },
    });
  } catch (error: any) {
    logger.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    logger.info(`Password changed for user: ${userId}`);

    res.json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error: any) {
    logger.error("Change password error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token required",
      });
    }

    const { verifyRefreshToken } = await import("../utils/jwt.utils");
    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    const newAccessToken = generateAccessToken(user.id);

    res.json({
      status: "success",
      data: {
        token: newAccessToken,
      },
    });
  } catch (error: any) {
    logger.error("Refresh token error:", error);
    res.status(401).json({
      status: "error",
      message: "Invalid refresh token",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        status: "success",
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = generateAccessToken(user.id);
    await emailService.sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset requested for: ${email}`);

    res.json({
      status: "success",
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error: any) {
    logger.error("Forgot password error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const { verifyAccessToken } = await import("../utils/jwt.utils");
    const decoded = verifyAccessToken(token);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password reset for user: ${decoded.userId}`);

    res.json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error: any) {
    logger.error("Reset password error:", error);
    res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  res.status(501).json({
    status: "error",
    message: "Google OAuth not implemented yet",
  });
};

export const googleCallback = async (req: Request, res: Response) => {
  res.status(501).json({
    status: "error",
    message: "Google OAuth not implemented yet",
  });
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      logger.info(`User logged out: ${req.user.email}`);

      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLogin: new Date(), // You might want to add a lastLogout field to schema
        },
      });
    }

    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error: any) {
    logger.error("Logout error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const logoutAllDevices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    logger.info(`User logged out from all devices: ${req.user.email}`);

    res.json({
      status: "success",
      message: "Logged out from all devices successfully",
      data: {
        note: "Please log in again on all devices",
      },
    });
  } catch (error: any) {
    logger.error("Logout all devices error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Patient Login - Step 1: Request OTP
 * Accepts email or phone number
 */
export const patientRequestOTP = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone)
      return res.status(400).json({
        status: "error",
        message: "Email or phone number is required",
      });

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          email ? { email: email.toLowerCase().trim() } : {},
          phone ? { phone: phone.trim() } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
      select: { id: true, email: true, firstName: true, isActive: true },
    });

    if (!patient || !patient.email)
      return res.json({
        status: "success",
        message: "If a patient account exists, an OTP has been sent",
      });
    if (!patient.isActive)
      return res
        .status(403)
        .json({ status: "error", message: "Patient account is deactivated" });

    // Delete old unverified OTPs
    await prisma.oTP.deleteMany({
      where: { email: patient.email, verified: false },
    });

    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.oTP.create({
      data: { email: patient.email, code: otpCode, expiresAt: otpExpiry },
    });

    await emailService.sendPatientOTPEmail(
      patient.email,
      otpCode,
      patient.firstName
    );
    logger.info(`Patient OTP sent to: ${patient.email}`);

    res.json({
      status: "success",
      message: "OTP has been sent to your email",
      data: {
        email: patient.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
        expiresIn: "10 minutes",
      },
    });
  } catch (error: any) {
    logger.error("Patient request OTP error:", error);
    res.status(500).json({ status: "error", message: "Failed to send OTP" });
  }
};

/**
 * Patient Login - Step 2: Verify OTP and Authenticate
 * Verifies the OTP and returns authentication tokens
 */
export const patientVerifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, phone, code } = req.body;
    if ((!email && !phone) || !code)
      return res.status(400).json({
        status: "error",
        message: "Email/phone and OTP code required",
      });

    const normalizedCode = String(code).trim();
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          email ? { email: email.toLowerCase().trim() } : {},
          phone ? { phone: phone.trim() } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
    });

    if (!patient || !patient.email)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    if (!patient.isActive)
      return res
        .status(403)
        .json({ status: "error", message: "Account is deactivated" });

    const otp = await prisma.oTP.findFirst({
      where: {
        email: patient.email,
        code: normalizedCode,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (!otp)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid or expired OTP" });

    await prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // Upsert patient User
    const patientUser = await prisma.user.upsert({
      where: { email: patient.email },
      update: {
        lastLogin: new Date(),
        patientId: patient.id,
        clinicId: patient.clinicId,
      },
      create: {
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone || undefined,
        role: "PATIENT",
        clinicId: patient.clinicId,
        patientId: patient.id,
        isVerified: true,
        isActive: true,
      },
    });

    const accessToken = generateAccessToken(patientUser.id);
    const refreshToken = generateRefreshToken(patientUser.id);

    logger.info(`Patient logged in via OTP: ${patient.email}`);

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: patientUser.id,
          patientId: patient.id,
          email: patient.email,
          firstName: patient.firstName,
          lastName: patient.lastName,
          phone: patient.phone,
          role: "PATIENT",
          patientNumber: patient.patientNumber,
          clinicId: patient.clinicId,
          isActive: patient.isActive,
          createdAt: patient.createdAt,
        },
      },
    });
  } catch (error: any) {
    logger.error("Patient verify OTP error:", error);
    res.status(500).json({ status: "error", message: "Authentication failed" });
  }
};

/**
 * Resend OTP for Patient
 */
export const patientResendOTP = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone)
      return res.status(400).json({
        status: "error",
        message: "Email or phone number is required",
      });

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          email ? { email: email.toLowerCase().trim() } : {},
          phone ? { phone: phone.trim() } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
      select: { id: true, email: true, firstName: true, isActive: true },
    });

    if (!patient || !patient.email)
      return res.json({
        status: "success",
        message: "If a patient account exists, an OTP has been sent",
      });
    if (!patient.isActive)
      return res
        .status(403)
        .json({ status: "error", message: "Account is deactivated" });

    const recentOTP = await prisma.oTP.findFirst({
      where: {
        email: patient.email,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recentOTP)
      return res.status(429).json({
        status: "error",
        message: "Please wait before requesting a new OTP",
      });

    await prisma.oTP.deleteMany({
      where: { email: patient.email, verified: false },
    });

    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.oTP.create({
      data: { email: patient.email, code: otpCode, expiresAt: otpExpiry },
    });

    await emailService.sendPatientOTPEmail(
      patient.email,
      otpCode,
      patient.firstName
    );
    logger.info(`Patient OTP resent to: ${patient.email}`);

    res.json({
      status: "success",
      message: "New OTP has been sent to your email",
    });
  } catch (error: any) {
    logger.error("Patient resend OTP error:", error);
    res.status(500).json({ status: "error", message: "Failed to resend OTP" });
  }
};
