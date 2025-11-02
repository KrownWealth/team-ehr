import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.utils";

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

  logger.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Prisma errors
  if (error.code === "P2002") {
    return res.status(409).json({
      status: "error",
      message: "A record with this data already exists",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      status: "error",
      message: "Record not found",
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      status: "error",
      message: "Invalid reference",
    });
  }

  // JWT errors
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

  // Validation errors
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
