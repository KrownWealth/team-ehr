import { Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth.middleware";
import { EmailService } from "../services/email.service";
import db from "../services/database.service";
import { generateTempPassword } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";

const emailService = new EmailService();

export const onboardClinic = async (req: AuthRequest, res: Response) => {
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

    const userId = req.user!.id;

    // Create clinic in Firestore
    const clinic = await db.createClinic({
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
      // createdAt: new Date(),
      // updatedAt: new Date(),
    });

    await db.updateUser(userId, { clinicId: clinic.id });

    logger.info(`Clinic onboarded: ${clinic.name}`);

    res.status(201).json({
      status: "success",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Clinic onboarding error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role, firstName, lastName, phone } = req.body;
    const { clinicId } = req;

    // Check if email already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "Email already exists" });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const staff = await db.createUser(email, {
      clinicId: clinicId!,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      isVerified: true,
      // mustChangePassword: true,
    });

    // Send invitation email
    await emailService.sendStaffInvitationEmail(
      email,
      firstName,
      tempPassword,
      role
    );

    logger.info(`Staff created: ${email}`);

    res.status(201).json({
      status: "success",
      message: "Staff created and invitation sent",
      data: staff,
    });
  } catch (error: any) {
    logger.error("Create staff error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.clinicId;

    const updated = await db.updateUser(id, updateData, clinicId);
    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "Staff member not found" });
    }

    logger.info(`Staff updated: ${id}`);
    res.json({
      status: "success",
      message: "Staff member updated successfully",
    });
  } catch (error: any) {
    logger.error("Update staff error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const toggleStaffStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;
    const { isActive } = req.body;

    const updated = await db.updateUser(id, { isActive }, clinicId);
    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "Staff member not found" });
    }

    logger.info(`Staff status updated: ${id} -> ${isActive}`);
    res.json({
      status: "success",
      message: `Staff member ${isActive ? "activated" : "deactivated"}`,
    });
  } catch (error: any) {
    logger.error("Toggle staff status error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getClinicProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const clinic = await db.getClinic(clinicId!);
    if (!clinic) {
      return res
        .status(404)
        .json({ status: "error", message: "Clinic not found" });
    }

    res.json({ status: "success", data: clinic });
  } catch (error: any) {
    logger.error("Get clinic profile error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateClinic = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const updateData = req.body;

    const clinic = await db.updateClinic(clinicId!, updateData);
    if (!clinic) {
      return res
        .status(404)
        .json({ status: "error", message: "Clinic not found" });
    }

    logger.info(`Clinic updated: ${clinicId}`);
    res.json({ status: "success", data: clinic });
  } catch (error: any) {
    logger.error("Update clinic error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, phone, licenseId, photoUrl } = req.body;

    const user = await db.updateUser(userId, {
      firstName,
      lastName,
      phone,
      licenseId,
      photoUrl,
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    logger.info(`Profile updated: ${userId}`);
    res.json({ status: "success", data: user });
  } catch (error: any) {
    logger.error("Update profile error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
