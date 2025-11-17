// backend/src/utils/response.utils.ts

import { Response } from "express";

/**
 * Standard API Response Structure
 * All API responses should follow this format
 */
export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Paginated Response Structure
 */
export interface PaginatedResponse<T = any> {
  status: "success";
  message?: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

/**
 * Success Response - 200 OK
 */
export const successResponse = <T>(
  res: Response,
  data?: T,
  message?: string
): Response => {
  return res.status(200).json({
    status: "success",
    message: message || "Request successful",
    data,
  });
};

/**
 * Created Response - 201 Created
 */
export const createdResponse = <T>(
  res: Response,
  data?: T,
  message?: string,
  meta?: Record<string, any>
): Response => {
  const response: any = {
    status: "success",
    message: message || "Resource created successfully",
    data,
  };

  // Include metadata if provided (e.g., alerts, warnings, counts)
  if (meta && Object.keys(meta).length > 0) {
    Object.assign(response, meta);
  }

  return res.status(201).json(response);
};

/**
 * No Content Response - 204 No Content
 */
export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Bad Request Response - 400 Bad Request
 */
export const badRequestResponse = (
  res: Response,
  message?: string,
  error?: any
): Response => {
  return res.status(400).json({
    status: "error",
    message: message || "Bad request",
    error: typeof error === "string" ? error : error?.message,
  });
};

/**
 * Unauthorized Response - 401 Unauthorized
 */
export const unauthorizedResponse = (
  res: Response,
  message?: string
): Response => {
  return res.status(401).json({
    status: "error",
    message: message || "Unauthorized access",
  });
};

/**
 * Forbidden Response - 403 Forbidden
 */
export const forbiddenResponse = (
  res: Response,
  message?: string
): Response => {
  return res.status(403).json({
    status: "error",
    message: message || "Access forbidden",
  });
};

/**
 * Not Found Response - 404 Not Found
 */
export const notFoundResponse = (
  res: Response,
  resource?: string
): Response => {
  return res.status(404).json({
    status: "error",
    message: `${resource || "Resource"} not found`,
  });
};

/**
 * Conflict Response - 409 Conflict
 */
export const conflictResponse = (res: Response, message?: string): Response => {
  return res.status(409).json({
    status: "error",
    message: message || "Resource conflict",
  });
};

/**
 * Validation Error Response - 422 Unprocessable Entity
 */
export const validationErrorResponse = (
  res: Response,
  errors: any[]
): Response => {
  return res.status(422).json({
    status: "error",
    message: "Validation failed",
    data: {
      errors,
    },
  });
};

export const serverErrorResponse = (
  res: Response,
  message?: string,
  error?: any
): Response => {
  return res.status(500).json({
    status: "error",
    message: message || "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error?.message || error
        : undefined,
  });
};

/**
 * Paginated Success Response
 */
export const paginatedResponse = <T>(
  res: Response,
  items: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): Response => {
  return res.status(200).json({
    status: "success",
    message: message || "Request successful",
    data: {
      items,
      pagination: {
        ...pagination,
        pages: Math.ceil(pagination.total / pagination.limit),
      },
    },
  });
};

/**
 * Custom Status Response
 */
export const customResponse = (
  res: Response,
  statusCode: number,
  status: "success" | "error",
  message?: string,
  data?: any
): Response => {
  const response: ApiResponse = {
    status,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Rate Limited Response - 429 Too Many Requests
 */
export const rateLimitResponse = (
  res: Response,
  retryAfter?: number
): Response => {
  return res.status(429).json({
    status: "error",
    message: "Too many requests, please try again later",
    data: retryAfter ? { retryAfter } : undefined,
  });
};

/**
 * Service Unavailable Response - 503 Service Unavailable
 */
export const serviceUnavailableResponse = (
  res: Response,
  message?: string
): Response => {
  return res.status(503).json({
    status: "error",
    message: message || "Service temporarily unavailable",
  });
};
