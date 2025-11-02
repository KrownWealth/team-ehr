import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { PubSubService } from "../services/pubsub.service";
import { AnalyticsService } from "../services/analytics.service";
import { generateBillNumber } from "../utils/helpers.utils";
import logger from "../utils/logger.utils";

const pubsubService = new PubSubService();
const analyticsService = new AnalyticsService();

export const createBill = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, items, notes } = req.body;
    const { clinicId } = req;

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );
    const year = new Date().getFullYear();
    const billCount = await prisma.bill.count({
      where: {
        clinicId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const billNumber = generateBillNumber(year, billCount);

    const bill = await prisma.bill.create({
      data: {
        clinicId: clinicId!,
        patientId,
        billNumber,
        items,
        totalAmount,
        balance: totalAmount,
        notes,
      },
      include: {
        patient: true,
      },
    });

    logger.info(`Bill created: ${bill.billNumber}`);

    res.status(201).json({
      status: "success",
      data: bill,
    });
  } catch (error: any) {
    logger.error("Create bill error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getBillById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const bill = await prisma.bill.findFirst({
      where: { id, clinicId },
      include: {
        patient: true,
      },
    });

    if (!bill) {
      return res.status(404).json({
        status: "error",
        message: "Bill not found",
      });
    }

    res.json({
      status: "success",
      data: bill,
    });
  } catch (error: any) {
    logger.error("Get bill by ID error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateBill = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;
    const updateData = req.body;

    const bill = await prisma.bill.updateMany({
      where: { id, clinicId },
      data: updateData,
    });

    if (bill.count === 0) {
      return res.status(404).json({
        status: "error",
        message: "Bill not found",
      });
    }

    logger.info(`Bill updated: ${id}`);

    res.json({
      status: "success",
      message: "Bill updated successfully",
    });
  } catch (error: any) {
    logger.error("Update bill error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { billId, amount, paymentMethod } = req.body;
    const { clinicId } = req;

    const bill = await prisma.bill.findFirst({
      where: { id: billId, clinicId },
    });

    if (!bill) {
      return res.status(404).json({
        status: "error",
        message: "Bill not found",
      });
    }

    const newAmountPaid = bill.amountPaid + amount;
    const newBalance = bill.totalAmount - newAmountPaid;
    const newStatus = newBalance <= 0 ? "PAID" : "PARTIAL";

    const updated = await prisma.bill.update({
      where: { id: billId },
      data: {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
        paymentMethod,
        paymentDate: new Date(),
      },
      include: {
        patient: true,
      },
    });

    // Publish payment event
    await pubsubService.publishPaymentReceived({
      billId: updated.id,
      patientId: updated.patientId,
      amount,
      clinicId,
    });

    // Record in BigQuery
    await analyticsService.recordPatientVisit({
      patientId: updated.patientId,
      clinicId: clinicId!,
      diagnosis: "N/A",
      amount,
    });

    logger.info(`Payment recorded: ${billId}`);

    res.json({
      status: "success",
      data: updated,
    });
  } catch (error: any) {
    logger.error("Record payment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const where: any = { clinicId, status: { in: ["PAID", "PARTIAL"] } };

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [payments, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { paymentDate: "desc" },
        include: {
          patient: {
            select: {
              patientNumber: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.bill.count({ where }),
    ]);

    res.json({
      status: "success",
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error("Get all payments error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getRevenueReport = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { date } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const dateString = targetDate.toISOString().split("T")[0];

    const dailyRevenue = await analyticsService.getDailyRevenue(
      clinicId!,
      dateString
    );

    const monthlyTrends = await analyticsService.getMonthlyTrends(clinicId!);

    res.json({
      status: "success",
      data: {
        daily: dailyRevenue,
        monthly: monthlyTrends,
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

export const getOutstandingBalances = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { clinicId } = req;

    const outstanding = await prisma.bill.findMany({
      where: {
        clinicId,
        balance: { gt: 0 },
        status: { in: ["PENDING", "PARTIAL"] },
      },
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
      orderBy: { createdAt: "desc" },
    });

    const totalOutstanding = outstanding.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );

    res.json({
      status: "success",
      data: {
        bills: outstanding,
        total: totalOutstanding,
        count: outstanding.length,
      },
    });
  } catch (error: any) {
    logger.error("Get outstanding balances error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
