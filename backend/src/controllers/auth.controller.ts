import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import logger from "../utils/logger.utils";
import prisma from "../config/database";

export interface AuthRequest extends Request {
  user?: any;
  clinicId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // ✅ FIX: Fetch user from Prisma (PostgreSQL) instead of Firestore
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        licenseId: true,
        photoUrl: true,
        isActive: true,
        isVerified: true,
        clinicId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token or user deactivated",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email first",
      });
    }

    req.user = user;
    req.clinicId = user.clinicId ?? undefined;

    logger.debug(`User authenticated: ${user.email}`);
    next();
  } catch (error: any) {
    logger.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Authentication failed",
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Permissions Denied",
      });
    }

    next();
  };
};
