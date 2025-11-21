import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { QueueService } from "../services/queue.service";
import { pubsubService } from "../services/pubsub.service";
import logger from "../utils/logger.utils";

const queueService = new QueueService();

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, appointmentDate, reason, notes } = req.body;
    const { clinicId } = req;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found in this clinic",
      });
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        appointmentDate: new Date(appointmentDate),
        status: { in: ["SCHEDULED", "CHECKED_IN", "IN_CONSULTATION"] },
      },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        status: "error",
        message: "Patient already has an appointment at this time",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        appointmentDate: new Date(appointmentDate),
        reason,
        notes,
        status: "SCHEDULED",
      },
      include: {
        patient: {
          select: {
            patientNumber: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (patient.email) {
      await pubsubService.publishAppointmentScheduled({
        appointmentId: appointment.id,
        patientEmail: patient.email,
        patientFirstName: patient.firstName,
        appointmentDate: new Date(appointmentDate),
        reason,
      });
    }

    logger.info(`Appointment created: ${appointment.id}`);

    res.status(201).json({
      status: "success",
      data: appointment,
    });
  } catch (error: any) {
    logger.error("Create appointment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { date, status, patientId, page = 1, limit = 50 } = req.query;

    const where: any = {
      patient: { clinicId },
    };

    if (date) {
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.appointmentDate = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { appointmentDate: "asc" },
        include: {
          patient: {
            select: {
              patientNumber: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      status: "success",
      data: {
        appointments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error("Get all appointments error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    res.json({
      status: "success",
      data: appointment,
    });
  } catch (error: any) {
    logger.error("Get appointment by ID error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;
    const updateData = req.body;

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
      include: {
        patient: {
          select: { email: true, firstName: true },
        },
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    if (updateData.appointmentDate) {
      updateData.appointmentDate = new Date(updateData.appointmentDate);
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
      },
    });

    logger.info(`Appointment updated: ${id}`);

    res.json({
      status: "success",
      data: appointment,
    });
  } catch (error: any) {
    logger.error("Update appointment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const checkInAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "SCHEDULED") {
      return res.status(400).json({
        status: "error",
        message: `Cannot check in appointment with status: ${appointment.status}`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CHECKED_IN" },
      include: { patient: true },
    });

    await queueService.addToQueue(
      appointment.patientId,
      `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      clinicId!,
      1
    );

    logger.info(`Patient checked in for appointment: ${id}`);

    res.json({
      status: "success",
      data: updated,
      message: "Patient checked in and added to queue",
    });
  } catch (error: any) {
    logger.error("Check in appointment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const startConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "CHECKED_IN") {
      return res.status(400).json({
        status: "error",
        message: "Patient must be checked in before starting consultation",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "IN_CONSULTATION" },
    });

    logger.info(`Consultation started for appointment: ${id}`);

    res.json({
      status: "success",
      data: updated,
    });
  } catch (error: any) {
    logger.error("Start consultation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const completeAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    logger.info(`Appointment completed: ${id}`);

    res.json({
      status: "success",
      data: updated,
    });
  } catch (error: any) {
    logger.error("Complete appointment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { clinicId } = req;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        patient: { clinicId },
      },
      include: {
        patient: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        notes: reason || appointment.notes,
      },
    });

    if (appointment.patient.email) {
      await pubsubService.publishAppointmentCancelled({
        appointmentId: appointment.id,
        patientEmail: appointment.patient.email,
        patientFirstName: appointment.patient.firstName,
        appointmentDate: appointment.appointmentDate,
        reason,
      });
    }

    logger.info(`Appointment cancelled: ${id}`);

    res.json({
      status: "success",
      data: updated,
    });
  } catch (error: any) {
    logger.error("Cancel appointment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getTodayAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        patient: { clinicId },
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { appointmentDate: "asc" },
      include: {
        patient: {
          select: {
            patientNumber: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    const summary = {
      total: appointments.length,
      scheduled: appointments.filter((a: any) => a.status === "SCHEDULED")
        .length,
      checkedIn: appointments.filter((a: any) => a.status === "CHECKED_IN")
        .length,
      inConsultation: appointments.filter(
        (a: any) => a.status === "IN_CONSULTATION"
      ).length,
      completed: appointments.filter((a: any) => a.status === "COMPLETED")
        .length,
      cancelled: appointments.filter((a: any) => a.status === "CANCELLED")
        .length,
    };

    res.json({
      status: "success",
      data: {
        appointments,
        summary,
      },
    });
  } catch (error: any) {
    logger.error("Get today's appointments error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
