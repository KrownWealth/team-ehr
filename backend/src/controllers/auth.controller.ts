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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with pending clinic status
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

    // Create and send OTP
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
 * Register Regular User (Staff)
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

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
      },
    });

    // Create and send OTP
    await createAndSendOTP(email);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      status: "success",
      message: "Registration successful. Please verify your email.",
      data: { id: user.id, email: user.email },
    });
  } catch (error: any) {
    logger.error("Register error:", error);
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

    // Check if user exists and is not verified
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

    // Create and send new OTP
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

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // Mark user as verified
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

/**
 * Login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log(user, email, password)

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

    // Update last login
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

/**
 * Change Password
 */
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

/**
 * Refresh Token
 */
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

/**
 * Forgot Password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
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

/**
 * Reset Password
 */
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

/**
 * Google OAuth (Placeholder)
 */
export const googleAuth = async (req: Request, res: Response) => {
  res.status(501).json({
    status: "error",
    message: "Google OAuth not implemented yet",
  });
};

/**
 * Google OAuth Callback (Placeholder)
 */
export const googleCallback = async (req: Request, res: Response) => {
  res.status(501).json({
    status: "error",
    message: "Google OAuth not implemented yet",
  });
};
