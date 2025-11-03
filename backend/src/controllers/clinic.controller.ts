import { Request, Response } from "express";
import db, { Clinic } from "../services/database.service";
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

    // Check if clinic already exists by email
    const existingClinics = await db.listClinics();
    const existingClinic = existingClinics.find((c) => c.email === email);

    if (existingClinic) {
      return res.status(400).json({
        status: "error",
        message: "Clinic already registered with this email.",
      });
    }

    // Create new clinic
    const newClinic: Clinic = await db.createClinic({
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
    });

    logger.info(`Clinic registered successfully: ${newClinic.email}`);

    return res.status(201).json({
      status: "success",
      message: "Clinic registered successfully.",
      data: newClinic,
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
    const clinics = await db.listClinics();
    res.json({ status: "success", data: clinics });
  } catch (error: any) {
    logger.error("Error fetching clinics:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Fetch clinic by ID
export const getClinicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinic = await db.getClinic(id);

    if (!clinic) {
      return res
        .status(404)
        .json({ status: "error", message: "Clinic not found" });
    }

    res.json({ status: "success", data: clinic });
  } catch (error: any) {
    logger.error("Error fetching clinic:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update clinic
export const updateClinic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Fetch existing clinic first
    const clinic = await db.getClinic(id);
    if (!clinic) {
      return res
        .status(404)
        .json({ status: "error", message: "Clinic not found" });
    }

    const updatedClinic: Clinic = {
      ...clinic,
      ...updateData,
      updatedAt: new Date(),
    };

    await db.createClinic(updatedClinic); // Firestore set() will overwrite by ID
    res.json({
      status: "success",
      message: "Clinic updated successfully.",
      data: updatedClinic,
    });
  } catch (error: any) {
    logger.error("Error updating clinic:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
