import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import db from "../services/database.service";
import logger from "../utils/logger.utils";

export const addToQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.body;
    const { clinicId } = req;

    if (!patientId || !clinicId) {
      return res.status(400).json({
        status: "error",
        message: "Patient ID and clinic ID are required",
      });
    }

    const result = await db.addToQueue(patientId, clinicId);

    if (!result.success) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to add patient to queue" });
    }

    logger.info(`Patient added to queue: ${patientId}`);
    res.status(201).json({
      status: "success",
      message: "Patient added to queue successfully",
    });
  } catch (error: any) {
    logger.error("Add to queue error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getClinicQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    const queue = await db.getQueue(clinicId!);

    res.json({
      status: "success",
      data: {
        queue,
        count: queue.length,
      },
    });
  } catch (error: any) {
    logger.error("Get queue error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

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

    const result = await db.updateQueueStatus(id, status);
    if (!result.success) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to update queue status" });
    }

    logger.info(`Queue status updated: ${id} -> ${status}`);
    res.json({
      status: "success",
      message: "Queue status updated successfully",
    });
  } catch (error: any) {
    logger.error("Update queue status error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const removeFromQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.updateQueueStatus(id, "COMPLETED");
    if (!result.success) {
      return res.status(500).json({
        status: "error",
        message: "Failed to remove patient from queue",
      });
    }

    logger.info(`Patient removed from queue: ${id}`);
    res.json({
      status: "success",
      message: "Patient removed from queue successfully",
    });
  } catch (error: any) {
    logger.error("Remove from queue error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getNextPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    const queue = await db.getQueue(clinicId!);
    const nextPatient = queue.find((item) => item.status === "WAITING");

    res.json({
      status: "success",
      data: nextPatient || null,
      message: nextPatient ? undefined : "No patients waiting in queue",
    });
  } catch (error: any) {
    logger.error("Get next patient error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
