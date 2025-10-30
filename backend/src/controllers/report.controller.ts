import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/database";
import { AnalyticsService } from "../services/analytics.service";
import logger from "../utils/logger.utils";

const analyticsService = new AnalyticsService();

/**
 * Get revenue report
 */
export const getRevenueReport = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { startDate, endDate, period = "daily" } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get revenue data
    const bills = await prisma.bill.findMany({
      where: {
        clinicId,
        paymentDate: {
          gte: start,
          lte: end,
        },
        status: { in: ["PAID", "PARTIAL"] },
      },
      select: {
        amountPaid: true,
        paymentDate: true,
        paymentMethod: true,
      },
    });

    // Calculate totals
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.amountPaid, 0);
    const totalTransactions = bills.length;

    // Group by payment method
    const byPaymentMethod = bills.reduce((acc: any, bill) => {
      const method = bill.paymentMethod || "UNKNOWN";
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count++;
      acc[method].amount += bill.amountPaid;
      return acc;
    }, {});

    // Group by period
    const byPeriod = bills.reduce((acc: any, bill) => {
      if (!bill.paymentDate) return acc;

      const date = new Date(bill.paymentDate);
      let key: string;

      if (period === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (period === "weekly") {
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-W${weekNum}`;
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      } else {
        key = date.toISOString().split("T")[0];
      }

      if (!acc[key]) {
        acc[key] = { date: key, amount: 0, count: 0 };
      }
      acc[key].amount += bill.amountPaid;
      acc[key].count++;
      return acc;
    }, {});

    res.json({
      status: "success",
      data: {
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransaction:
            totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
          period: { start, end },
        },
        byPaymentMethod,
        byPeriod: Object.values(byPeriod),
      },
    });
  } catch (error: any) {
    logger.error("Get revenue report error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get patient statistics
 */
export const getPatientStats = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total patients
    const totalPatients = await prisma.patient.count({
      where: { clinicId, isActive: true },
    });

    // New patients in period
    const newPatients = await prisma.patient.count({
      where: {
        clinicId,
        createdAt: { gte: start, lte: end },
      },
    });

    // Patients by gender
    const byGender = await prisma.patient.groupBy({
      by: ["gender"],
      where: { clinicId, isActive: true },
      _count: true,
    });

    // Patients by age group
    const patients = await prisma.patient.findMany({
      where: { clinicId, isActive: true },
      select: { birthDate: true },
    });

    const ageGroups = {
      "0-18": 0,
      "19-35": 0,
      "36-50": 0,
      "51-65": 0,
      "65+": 0,
    };

    patients.forEach((patient) => {
      const age = Math.floor(
        (Date.now() - new Date(patient.birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      );

      if (age <= 18) ageGroups["0-18"]++;
      else if (age <= 35) ageGroups["19-35"]++;
      else if (age <= 50) ageGroups["36-50"]++;
      else if (age <= 65) ageGroups["51-65"]++;
      else ageGroups["65+"]++;
    });

    res.json({
      status: "success",
      data: {
        totalPatients,
        newPatients,
        byGender,
        ageGroups,
        period: { start, end },
      },
    });
  } catch (error: any) {
    logger.error("Get patient stats error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get consultation metrics
 */
export const getConsultationMetrics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { clinicId } = req;
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total consultations
    const totalConsultations = await prisma.consultation.count({
      where: {
        clinicId,
        createdAt: { gte: start, lte: end },
      },
    });

    // Consultations by doctor
    const byDoctor = await prisma.consultation.groupBy({
      by: ["doctorId"],
      where: {
        clinicId,
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    // Get doctor details
    const doctorIds = byDoctor.map((d) => d.doctorId);
    const doctors = await prisma.user.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const consultationsByDoctor = byDoctor.map((d) => {
      const doctor = doctors.find((doc) => doc.id === d.doctorId);
      return {
        doctorId: d.doctorId,
        doctorName: doctor
          ? `${doctor.firstName} ${doctor.lastName}`
          : "Unknown",
        count: d._count,
      };
    });

    // Daily consultation trend
    const consultations = await prisma.consultation.findMany({
      where: {
        clinicId,
        createdAt: { gte: start, lte: end },
      },
      select: { createdAt: true },
    });

    const dailyTrend = consultations.reduce((acc: any, cons) => {
      const date = new Date(cons.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {});

    res.json({
      status: "success",
      data: {
        totalConsultations,
        averagePerDay:
          totalConsultations /
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
        byDoctor: consultationsByDoctor,
        dailyTrend: Object.values(dailyTrend),
        period: { start, end },
      },
    });
  } catch (error: any) {
    logger.error("Get consultation metrics error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Export reports (placeholder - would generate PDF/Excel)
 */
export const exportReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportType, format, startDate, endDate } = req.query;

    // This is a placeholder implementation
    // In production, you would use libraries like:
    // - pdfkit or puppeteer for PDF generation
    // - exceljs for Excel generation

    res.json({
      status: "success",
      message: "Report export feature coming soon",
      data: {
        reportType,
        format,
        period: { startDate, endDate },
        note: "Implement with pdfkit/exceljs for production",
      },
    });
  } catch (error: any) {
    logger.error("Export report error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get appointment statistics
 */
export const getAppointmentStats = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    const appointments = await prisma.appointment.findMany({
      where: {
        patient: { clinicId },
        appointmentDate: { gte: start, lte: end },
      },
      select: { status: true, appointmentDate: true },
    });

    const byStatus = appointments.reduce((acc: any, appt) => {
      const status = appt.status;
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});

    res.json({
      status: "success",
      data: {
        total: appointments.length,
        byStatus,
        period: { start, end },
      },
    });
  } catch (error: any) {
    logger.error("Get appointment stats error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
