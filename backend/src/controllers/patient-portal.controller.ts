import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/database";
import logger from "../utils/logger.utils";
import { checkVitalFlags } from "../utils/helpers.utils";
import { Prisma } from "@prisma/client";
import {
  createdResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/response.utils";

export const getPatientDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.patientId;

    if (!patientId) {
      return forbiddenResponse(res, "Access denied. Patient account required.");
    }

    const [patient, upcomingAppointments, recentVitals, recentConsultations] =
      await Promise.all([
        prisma.patient.findUnique({
          where: { id: patientId },
          select: {
            id: true,
            patientNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
            birthDate: true,
            bloodGroup: true,
            allergies: true,
            chronicConditions: true,
            phone: true,
            photoUrl: true,
            email: true,
            addressLine: true,
            state: true,
            city: true,
            country: true,
          },
        }),
        prisma.appointment.findMany({
          where: {
            patientId,
            appointmentDate: { gte: new Date() },
            status: { in: ["SCHEDULED", "CHECKED_IN"] },
          },
          orderBy: { appointmentDate: "asc" },
          take: 5,
        }),
        prisma.vitals.findMany({
          where: { patientId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            recordedBy: {
              select: { firstName: true, lastName: true },
            },
          },
        }),
        prisma.consultation.findMany({
          where: { patientId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            assessment: true,
            plan: true,
            prescriptions: true,
            createdAt: true,
            doctor: {
              select: { firstName: true, lastName: true },
            },
          },
        }),
      ]);

    if (!patient) {
      return notFoundResponse(res, "Patient record not found");
    }

    // More precise age calculation
    const birthDate = new Date(patient.birthDate);
    let age = new Date().getFullYear() - birthDate.getFullYear();
    const m = new Date().getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
      age -= 1;
    }

    const latestVital = recentVitals[0];
    const healthAlerts = latestVital?.flags || [];

    return successResponse(
      res,
      {
        patient_info: { ...patient, age },
        health_summary: {
          latest_vitals: latestVital,
          critical_alerts: healthAlerts.filter((f: string) =>
            f.startsWith("CRITICAL")
          ),
          warnings: healthAlerts.filter((f: string) => f.startsWith("WARNING")),
        },
        upcoming_appointments: upcomingAppointments,
        recent_vitals: recentVitals,
        recent_consultations: recentConsultations,
      },
      "Patient dashboard retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Patient dashboard error:", error);
    return serverErrorResponse(res, "Failed to retrieve dashboard", error);
  }
};

export const recordSelfVitals = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.patientId;
    const userId = req.user?.id;

    if (!patientId || !userId) {
      return forbiddenResponse(res, "Access denied. Patient account required.");
    }

    const { bloodPressure, temperature, pulse, weight, bloodGlucose, notes } =
      req.body;

    const vitalsData: any = {};
    if (bloodPressure) vitalsData.bloodPressure = bloodPressure;
    if (temperature && !isNaN(Number(temperature)))
      vitalsData.temperature = parseFloat(temperature);
    if (pulse && !isNaN(Number(pulse))) vitalsData.pulse = parseInt(pulse);
    if (weight && !isNaN(Number(weight)))
      vitalsData.weight = parseFloat(weight);
    if (bloodGlucose && !isNaN(Number(bloodGlucose)))
      vitalsData.bloodGlucose = parseFloat(bloodGlucose);
    if (notes) vitalsData.notes = notes;

    const flags = checkVitalFlags(vitalsData);

    const vitals = await prisma.vitals.create({
      data: {
        patientId,
        recordedById: userId,
        ...vitalsData,
        flags,
      },
    });

    const criticalFlags = flags.filter((f: string) => f.startsWith("CRITICAL"));
    if (criticalFlags.length > 0) {
      logger.warn(
        `Critical vitals self-recorded by patient ${patientId}: ${criticalFlags.join(
          ", "
        )}`
      );
    }

    logger.info(`Patient ${patientId} self-recorded vitals`);

    return createdResponse(
      res,
      vitals,
      "Vitals recorded successfully",
      criticalFlags.length > 0
        ? {
            alerts: {
              critical: true,
              message:
                "Critical readings detected. Your healthcare provider has been notified.",
              flags: criticalFlags,
            },
          }
        : undefined
    );
  } catch (error: any) {
    logger.error("Self-record vitals error:", error);
    return serverErrorResponse(res, "Failed to record vitals", error);
  }
};

export const getMedicationReminders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const patientId = req.user?.patientId;

    if (!patientId) {
      return forbiddenResponse(res, "Access denied. Patient account required.");
    }

    const recentConsultations = await prisma.consultation.findMany({
      where: {
        patientId,
        prescriptions: { not: Prisma.JsonNull },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        doctor: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const activeMedications: any[] = [];
    recentConsultations.forEach((consultation) => {
      const prescriptions = consultation.prescriptions as any[];
      if (Array.isArray(prescriptions)) {
        prescriptions.forEach((rx) => {
          activeMedications.push({
            ...rx,
            prescribed_date: consultation.createdAt,
            prescribed_by: `Dr. ${consultation.doctor.firstName} ${consultation.doctor.lastName}`,
          });
        });
      }
    });

    res.json({
      status: "success",
      data: {
        active_medications: activeMedications,
        reminder_note:
          "Set reminders on your device to take medications as prescribed",
      },
    });
  } catch (error: any) {
    logger.error("Medication reminders error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const requestAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.patientId;
    const { preferredDate, reason, notes } = req.body;

    if (!patientId) {
      return forbiddenResponse(res, "Access denied. Patient account required.");
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        appointmentDate: new Date(preferredDate),
        reason,
        notes,
        status: "SCHEDULED",
      },
    });

    logger.info(`Patient ${patientId} requested appointment`);

    res.status(201).json({
      status: "success",
      data: appointment,
      message:
        "Appointment request submitted. You will receive confirmation soon.",
    });
  } catch (error: any) {
    logger.error("Request appointment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getMyMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.patientId;
    const { type, limit = 20, page = 1 } = req.query;

    if (!patientId) {
      return forbiddenResponse(res, "Access denied. Patient account required.");
    }

    let records: any = {};

    if (!type || type === "consultations") {
      records.consultations = await prisma.consultation.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          subjective: true,
          objective: true,
          assessment: true,
          plan: true,
          prescriptions: true,
          labOrders: true,
          followUpDate: true,
          createdAt: true,
          doctor: {
            select: { firstName: true, lastName: true, licenseId: true },
          },
        },
      });
    }

    if (!type || type === "vitals") {
      records.vitals = await prisma.vitals.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });
    }

    if (!type || type === "appointments") {
      records.appointments = await prisma.appointment.findMany({
        where: { patientId },
        orderBy: { appointmentDate: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });
    }

    if (type === "prescriptions") {
      const consultations = await prisma.consultation.findMany({
        where: {
          patientId,
          prescriptions: { not: Prisma.JsonNull },
        },
        orderBy: { createdAt: "desc" },
        include: {
          doctor: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      const prescriptions: any[] = [];

      consultations.forEach((c) => {
        // Make sure prescriptions is an array of objects
        const rxList = Array.isArray(c.prescriptions)
          ? (c.prescriptions as Record<string, any>[])
          : [];

        rxList.forEach((rx) =>
          prescriptions.push({
            ...(typeof rx === "object" && rx !== null ? rx : {}),
            prescribed_date: c.createdAt,
            prescribed_by: `Dr. ${c.doctor?.firstName ?? ""} ${
              c.doctor?.lastName ?? ""
            }`,
          })
        );
      });

      records.prescriptions = prescriptions;
    }

    res.json({
      status: "success",
      data: records,
    });
  } catch (error: any) {
    logger.error("Medical records error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getPersonalizedHealthTips = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const patientId = req.user?.patientId;

    if (!patientId) {
      return forbiddenResponse(res, "Access denied. Patient account required.");
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        chronicConditions: true,
        vitals: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    const tips: string[] = [];
    const resources: any[] = [];

    patient.chronicConditions.forEach((condition) => {
      const conditionLower = condition.toLowerCase();

      if (conditionLower.includes("diabetes")) {
        tips.push("Monitor your blood sugar levels regularly");
        tips.push("Follow a balanced diet with controlled carbohydrate intake");
        resources.push({
          title: "Living with Diabetes",
          url: "https://www.who.int/health-topics/diabetes",
        });
      }

      if (conditionLower.includes("hypertension")) {
        tips.push("Reduce salt intake in your diet");
        tips.push("Exercise regularly (at least 30 minutes daily)");
        resources.push({
          title: "Managing High Blood Pressure",
          url: "https://www.who.int/health-topics/hypertension",
        });
      }
    });

    if (tips.length === 0) {
      tips.push("Maintain a balanced diet with fruits and vegetables");
      tips.push("Stay physically active");
      tips.push("Get adequate sleep (7-9 hours)");
      tips.push("Stay hydrated");
    }

    res.json({
      status: "success",
      data: {
        personalized_tips: tips,
        educational_resources: resources,
        general_wellness: {
          message:
            "Regular check-ups and healthy lifestyle are key to wellness",
        },
      },
    });
  } catch (error: any) {
    logger.error("Health tips error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
