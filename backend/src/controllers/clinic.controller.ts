import { Request, Response } from "express";
import prisma from "../config/database";
import logger from "../utils/logger.utils";
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/response.utils";

export const getClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, clinics, "Clinics retrieved successfully");
  } catch (error: any) {
    logger.error("Get clinics error:", error);
    return serverErrorResponse(res, "Failed to retrieve clinics", error);
  }
};

export const getClinicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinic = await prisma.clinic.findUnique({ where: { id } });

    if (!clinic) {
      return notFoundResponse(res, "Clinic");
    }

    return successResponse(res, clinic, "Clinic retrieved successfully");
  } catch (error: any) {
    logger.error("Get clinic by ID error:", error);
    return serverErrorResponse(res, "Failed to retrieve clinic", error);
  }
};

export const updateClinic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return badRequestResponse(res, "Clinic ID is required");
    }

    const existingClinic = await prisma.clinic.findUnique({
      where: { id },
    });

    if (!existingClinic) {
      return notFoundResponse(res, "Clinic not found");
    }

    const clinic = await prisma.clinic.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, clinic, "Clinic updated successfully");
  } catch (error: any) {
    logger.error("Update clinic error:", error);
    return serverErrorResponse(res, "Failed to update clinic", error);
  }
};
