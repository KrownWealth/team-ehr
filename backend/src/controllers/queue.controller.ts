import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { QueueService } from "../services/queue.service";
import logger from "../utils/logger.utils";
import prisma from "../config/database";
import {
  createdResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/response.utils";

const queueService = new QueueService();

/**
 * Add patient to queue
 */
export const addToQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, priority } = req.body;
    const { clinicId } = req;

    // Verify patient exists and belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        patientNumber: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found in this clinic",
      });
    }

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const queueItem = await queueService.addToQueue(
      patientId,
      patientName,
      clinicId!,
      priority || 0
    );

    logger.info(`Patient added to queue: ${patientId}`);
    return createdResponse(
      res,
      queueItem,
      "Patient added to queue successfully"
    );
  } catch (error: any) {
    logger.error("Add to queue error:", error);
    return serverErrorResponse(
      res,
      "Failed to add patient to queue",
      error.message
    );
  }
};

/**
 * Get clinic queue
 */
export const getClinicQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    const queue = await queueService.getClinicQueue(clinicId!);
    return successResponse(res, queue.length, "Queue Retrieved successfully");
  } catch (error: any) {
    logger.error("Get queue error:", error);
    return serverErrorResponse(res, "Failed to retrieve queue", error);
  }
};

/**
 * Update queue status
 */
export const updateQueueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["WAITING", "IN_CONSULTATION", "COMPLETED"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid status. Must be WAITING, IN_CONSULTATION, or COMPLETED",
      });
    }

    await queueService.updateQueueStatus(id, status);

    logger.info(`Queue status updated: ${id} -> ${status}`);

    return successResponse(res, "Queue updated successfully");
  } catch (error: any) {
    logger.error("Queue update error:", error);
    return serverErrorResponse(res, "Failed to update queue", error);
  }
};
/**
 * Remove patient from queue
 */
export const removeFromQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    // Update status to COMPLETED to effectively remove from active queue
    await queueService.updateQueueStatus(id, "COMPLETED");

    logger.info(`Patient removed from queue: ${id}`);

    res.json({
      status: "success",
      message: "Patient removed from queue successfully",
    });
  } catch (error: any) {
    logger.error("Remove from queue error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get next patient in queue
 */
export const getNextPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    const queue = await queueService.getClinicQueue(clinicId!);
    const nextPatient = queue.find((item: any) => item.status === "WAITING");

    if (!nextPatient) {
      return res.json({
        status: "success",
        data: null,
        message: "No patients waiting in queue",
      });
    }

    res.json({
      status: "success",
      data: nextPatient,
    });
  } catch (error: any) {
    logger.error("Get next patient error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
