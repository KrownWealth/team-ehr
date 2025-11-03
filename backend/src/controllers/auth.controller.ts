import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.utils";
import { config } from "../config/env";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { EmailService } from "../services/email.service";
import { generateOTP } from "../utils/helpers.utils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Global Error Handling Middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Prisma unique constraint error
  if (error.code === "P2002") {
    return res.status(409).json({
      status: "error",
      message: "A record with this data already exists",
    });
  }

  // Prisma record not found
  if (error.code === "P2025") {
    return res.status(404).json({
      status: "error",
      message: "Record not found",
    });
  }

  // Prisma foreign key error
  if (error.code === "P2003") {
    return res.status(400).json({
      status: "error",
      message: "Invalid reference",
    });
  }

  // JWT invalid token
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }

  // JWT expired token
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expired",
    });
  }

  // Validation error (e.g., Joi or Zod)
  if (error.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }

  // Default error
  res.status(error.status || 500).json({
    status: "error",
    message: error.message || "Internal server error",
  });
};

const emailService = new EmailService();

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, terms } = req.body;

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

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt: otpExpiry,
      },
    });

    // Send OTP email
    await emailService.sendOTPEmail(email, otpCode);

    // Ensure "pending" clinic exists (fails silently if it already exists)
    await prisma.clinic.upsert({
      where: { id: "pending" },
      update: {},
      create: {
        id: "pending",
        name: "Pending Clinic",
        type: "Placeholder",
        address: "",
        city: "",
        state: "",
        lga: "",
        phone: "",
        email: "pending@system.local",
      },
    });

    // Create admin user (linked to placeholder clinic)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: "ADMIN",
        clinicId: "pending", // ✅ satisfies FK
        isVerified: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    logger.info(`Admin registered: ${email}`);

    return res.status(201).json({
      status: "success",
      message: "Admin registration successful. Please verify your email.",
      data: { user },
    });
  } catch (error: any) {
    logger.error("Admin registration error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    const validRoles = ["DOCTOR", "NURSE", "RECEPTIONIST", "STAFF"];
    const assignedRole = validRoles.includes(role) ? role : "STAFF";

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

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt: otpExpiry,
      },
    });

    await emailService.sendOTPEmail(email, otpCode);

    // Create user (not verified yet, no clinicId yet)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: assignedRole,
        isVerified: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      status: "success",
      message: "Registration successful. Please verify your email.",
      data: { user },
    });
  } catch (error: any) {
    logger.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // Find OTP
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        verified: false,
        expiresAt: { gte: new Date() },
      },
    });

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

    // Update user verification status
    await prisma.user.updateMany({
      where: { email },
      data: { isVerified: true },
    });

    logger.info(`Email verified: ${email}`);

    res.json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error: any) {
    logger.error("OTP verification error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { clinic: true },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email first",
      });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({
        status: "error",
        message: "Account has been deactivated",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password!);
    if (!isValidPassword) {
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

    // Generate tokens
    const token = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${email}`);

    res.json({
      status: "success",
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
        mustChangePassword: user.mustChangePassword,
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password!);
    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    logger.info(`Password changed: ${user.email}`);

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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId);

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
      // Don't reveal if user exists
      return res.json({
        status: "success",
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: "1h",
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset requested: ${email}`);

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

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password reset completed: ${decoded.userId}`);

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
  // Redirect to Google OAuth
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.oauth.google.clientId}&redirect_uri=${config.oauth.google.callbackUrl}&response_type=code&scope=profile email`;
  res.redirect(googleAuthUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    // This is a placeholder - implement full OAuth flow
    const { code } = req.query;

    // TODO: Exchange code for tokens with Google
    // TODO: Get user info from Google
    // TODO: Create or update user in database
    // TODO: Generate JWT tokens
    // TODO: Redirect to frontend with tokens

    res.json({
      status: "success",
      message: "Google OAuth callback - Implementation pending",
    });
  } catch (error: any) {
    logger.error("Google OAuth error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
