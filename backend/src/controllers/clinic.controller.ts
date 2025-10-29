import { Request, Response } from "express";
import prisma from "../config/database";
import logger from "../utils/logger.utils";

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
      return res.status(400).json({
        status: "error",
        message: "All required fields must be provided.",
      });
    }

    // Check if clinic already exists
    const existingClinic = await prisma.clinic.findUnique({
      where: { email },
    });

    if (existingClinic) {
      return res.status(400).json({
        status: "error",
        message: "Clinic already registered with this email.",
      });
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

    return res.status(201).json({
      status: "success",
      message: "Clinic registered successfully.",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Error registering clinic:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Fetch all clinics
export const getClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ status: "success", data: clinics });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Fetch clinic by ID
export const getClinicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinic = await prisma.clinic.findUnique({ where: { id } });

    if (!clinic) {
      return res
        .status(404)
        .json({ status: "error", message: "Clinic not found" });
    }

    res.json({ status: "success", data: clinic });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update clinic
export const updateClinic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const clinic = await prisma.clinic.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: "success",
      message: "Clinic updated successfully.",
      data: clinic,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
