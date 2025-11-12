import { Request, Response } from "express";
import prisma from "../config/database";
import logger from "../utils/logger.utils";
import {
  badRequestResponse,
  conflictResponse,
  createdResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/response.utils";

export const registerClinic = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      address,
      city,
      state,
      lga,
      phone,
      email,
      numberOfDoctors,
      averageDailyPatients,
    } = req.body;

    // Check for required fields
    if (
      !name ||
      !type ||
      !address ||
      !city ||
      !state ||
      !lga ||
      !phone ||
      !email
    ) {
      return badRequestResponse(res, "All required fields must be provided");
    }

    // Check if clinic already exists
    const existingClinic = await prisma.clinic.findUnique({
      where: { email },
    });

    if (existingClinic) {
      return conflictResponse(res, "Clinic already registered with this email");
    }

    // Create new clinic
    const clinic = await prisma.clinic.create({
      data: {
        name,
        type,
        address,
        city,
        state,
        lga,
        phone,
        email,
        numberOfDoctors: numberOfDoctors ? Number(numberOfDoctors) : null,
        averageDailyPatients: averageDailyPatients
          ? Number(averageDailyPatients)
          : null,
      },
    });

    logger.info(`Clinic registered successfully: ${clinic.email}`);

    return createdResponse(res, clinic, "Clinic registered successfully");
  } catch (error: any) {
    logger.error("Error registering clinic:", error);
    return serverErrorResponse(res, "Failed to register clinic", error);
  }
};

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
