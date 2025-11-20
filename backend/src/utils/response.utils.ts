import { Response } from "express";

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  status: "success";
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

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

  if (meta && Object.keys(meta).length > 0) {
    Object.assign(response, meta);
  }

  return res.status(201).json(response);
};

export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

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

export const unauthorizedResponse = (
  res: Response,
  message?: string
): Response => {
  return res.status(401).json({
    status: "error",
    message: message || "Unauthorized access",
  });
};

export const forbiddenResponse = (
  res: Response,
  message?: string
): Response => {
  return res.status(403).json({
    status: "error",
    message: message || "Access forbidden",
  });
};

export const notFoundResponse = (
  res: Response,
  resource?: string
): Response => {
  return res.status(404).json({
    status: "error",
    message: `${resource || "Resource"} not found`,
  });
};

export const conflictResponse = (res: Response, message?: string): Response => {
  return res.status(409).json({
    status: "error",
    message: message || "Resource conflict",
  });
};

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

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
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
    data,
    pagination: {
      ...pagination,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

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

export const serviceUnavailableResponse = (
  res: Response,
  message?: string
): Response => {
  return res.status(503).json({
    status: "error",
    message: message || "Service temporarily unavailable",
  });
};
