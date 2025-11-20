import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { EmailService } from "../services/email.service";
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

    // Create clinic
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
        numberOfDoctors,
        averageDailyPatients,
      },
    });

    // Update admin user with clinic ID
    await prisma.user.update({
      where: { id: userId },
      data: { clinicId: clinic.id, onboardingStatus: "COMPLETED" },
    });

    logger.info(`Clinic onboarded: ${clinic.name}`);

    res.status(201).json({
      status: "success",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Clinic onboarding error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role, firstName, lastName, phone } = req.body;
    const { clinicId } = req;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create staff user
    const staff = await prisma.user.create({
      data: {
        clinicId: clinicId!,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        // licenseId,
        isVerified: true,
        mustChangePassword: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        licenseId: true,
        createdAt: true,
      },
    });

    // Send invitation email with temporary password
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
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { role, isActive } = req.query;

    const where: any = { clinicId };

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const staff = await prisma.user.findMany({
      where,
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
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      status: "success",
      data: staff,
    });
  } catch (error: any) {
    logger.error("Get all staff error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getStaffById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const staff = await prisma.user.findFirst({
      where: { id, clinicId },
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
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!staff) {
      return res.status(404).json({
        status: "error",
        message: "Staff member not found",
      });
    }

    res.json({
      status: "success",
      data: staff,
    });
  } catch (error: any) {
    logger.error("Get staff by ID error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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

    const staff = await prisma.user.updateMany({
      where: { id, clinicId },
      data: updateData,
    });

    if (staff.count === 0) {
      return res.status(404).json({
        status: "error",
        message: "Staff member not found",
      });
    }

    logger.info(`Staff updated: ${id}`);

    res.json({
      status: "success",
      message: "Staff member updated successfully",
    });
  } catch (error: any) {
    logger.error("Update staff error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const deactivateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const staff = await prisma.user.updateMany({
      where: { id, clinicId },
      data: { isActive: false },
    });

    if (staff.count === 0) {
      return res.status(404).json({
        status: "error",
        message: "Staff member not found",
      });
    }

    logger.info(`Staff deactivated: ${id}`);

    res.json({
      status: "success",
      message: "Staff member deactivated",
    });
  } catch (error: any) {
    logger.error("Deactivate staff error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const activateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const staff = await prisma.user.updateMany({
      where: { id, clinicId },
      data: { isActive: true },
    });

    if (staff.count === 0) {
      return res.status(404).json({
        status: "error",
        message: "Staff member not found",
      });
    }

    logger.info(`Staff activated: ${id}`);

    res.json({
      status: "success",
      message: "Staff member activated",
    });
  } catch (error: any) {
    logger.error("Activate staff error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getClinicProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
          },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({
        status: "error",
        message: "Clinic not found",
      });
    }

    res.json({
      status: "success",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Get clinic profile error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateClinic = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const updateData = req.body;

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: updateData,
    });

    logger.info(`Clinic updated: ${clinicId}`);

    res.json({
      status: "success",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Update clinic error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, phone, licenseId, photoUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        licenseId,
        photoUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        licenseId: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        photoUrl: true,
      },
    });

    logger.info(`Profile updated: ${userId}`);

    res.json({
      status: "success",
      data: user,
    });
  } catch (error: any) {
    logger.error("Update profile error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    const [
      totalPatients,
      totalStaff,
      todayAppointments,
      pendingBills,
      todayRevenue,
    ] = await Promise.all([
      prisma.patient.count({
        where: { clinicId, isActive: true },
      }),
      prisma.user.count({
        where: { clinicId, isActive: true },
      }),
      prisma.appointment.count({
        where: {
          patient: { clinicId },
          appointmentDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.bill.count({
        where: {
          clinicId,
          status: "PENDING",
        },
      }),
      prisma.bill.aggregate({
        where: {
          clinicId,
          paymentDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        _sum: {
          amountPaid: true,
        },
      }),
    ]);

    res.json({
      status: "success",
      data: {
        totalPatients,
        totalStaff,
        todayAppointments,
        pendingBills,
        todayRevenue: todayRevenue._sum.amountPaid || 0,
      },
    });
  } catch (error: any) {
    logger.error("Get dashboard stats error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
