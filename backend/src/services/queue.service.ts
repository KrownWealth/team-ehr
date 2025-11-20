import prisma from "../config/database";
import logger from "../utils/logger.utils";
import { QueueStatus } from "@prisma/client";

export class QueueService {
  async addToQueue(
    patientId: string,
    patientName: string,
    clinicId: string,
    priority: number = 0
  ) {
    try {
      // Check if patient is already in queue
      const existingQueueItem = await prisma.queue.findFirst({
        where: {
          patientId,
          clinicId,
          status: {
            in: ["WAITING", "IN_CONSULTATION"],
          },
        },
      });

      if (existingQueueItem) {
        logger.warn(`Patient ${patientId} is already in queue`);
        return existingQueueItem;
      }

      const queueItem = await prisma.queue.create({
        data: {
          patientId,
          patientName,
          clinicId,
          priority,
          status: "WAITING",
          position: await this.getNextPosition(clinicId),
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
      });

      logger.info(`Patient added to queue: ${patientId}`);
      return queueItem;
    } catch (error) {
      logger.error("Failed to add to queue:", error);
      throw error;
    }
  }

  async getClinicQueue(clinicId: string) {
    try {
      const queue = await prisma.queue.findMany({
        where: {
          clinicId,
          status: {
            in: ["WAITING", "IN_CONSULTATION"],
          },
        },
        include: {
          patient: {
            select: {
              patientNumber: true,
              firstName: true,
              lastName: true,
              phone: true,
              photoUrl: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { position: "asc" },
          { createdAt: "asc" },
        ],
      });

      return queue;
    } catch (error) {
      logger.error("Failed to get clinic queue:", error);
      throw error;
    }
  }

  async updateQueueStatus(queueId: string, status: string) {
    try {
      // Validate status
      const validStatuses: QueueStatus[] = [
        QueueStatus.WAITING,
        QueueStatus.IN_CONSULTATION,
        QueueStatus.COMPLETED,
        QueueStatus.CANCELLED,
      ];

      if (!validStatuses.includes(status as QueueStatus)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const updated = await prisma.queue.update({
        where: { id: queueId },
        data: {
          status: status as QueueStatus, // type assertion fixes TS error
          updatedAt: new Date(),
        },
      });

      logger.info(`Queue status updated: ${queueId} -> ${status}`);
      return updated;
    } catch (error) {
      logger.error("Failed to update queue status:", error);
      throw error;
    }
  }

  async getNextPatient(clinicId: string) {
    try {
      const nextPatient = await prisma.queue.findFirst({
        where: {
          clinicId,
          status: "WAITING",
        },
        include: {
          patient: {
            select: {
              patientNumber: true,
              firstName: true,
              lastName: true,
              phone: true,
              photoUrl: true,
              allergies: true,
              chronicConditions: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { position: "asc" },
          { createdAt: "asc" },
        ],
      });

      return nextPatient;
    } catch (error) {
      logger.error("Failed to get next patient:", error);
      throw error;
    }
  }

  async removeFromQueue(queueId: string) {
    try {
      await this.updateQueueStatus(queueId, "COMPLETED");
      logger.info(`Patient removed from queue: ${queueId}`);
    } catch (error) {
      logger.error("Failed to remove from queue:", error);
      throw error;
    }
  }

  async getPatientPosition(patientId: string, clinicId: string) {
    try {
      const queueItems = await prisma.queue.findMany({
        where: {
          clinicId,
          status: "WAITING",
        },
        orderBy: [
          { priority: "desc" },
          { position: "asc" },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
          patientId: true,
        },
      });

      const position = queueItems.findIndex(
        (item) => item.patientId === patientId
      );
      return position !== -1 ? position + 1 : null;
    } catch (error) {
      logger.error("Failed to get patient position:", error);
      throw error;
    }
  }

  async getQueueStats(clinicId: string) {
    try {
      const [waiting, inConsultation, completedToday] = await Promise.all([
        prisma.queue.count({
          where: { clinicId, status: "WAITING" },
        }),
        prisma.queue.count({
          where: { clinicId, status: "IN_CONSULTATION" },
        }),
        prisma.queue.count({
          where: {
            clinicId,
            status: "COMPLETED",
            updatedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      return {
        waiting,
        inConsultation,
        completedToday,
        total: waiting + inConsultation,
      };
    } catch (error) {
      logger.error("Failed to get queue stats:", error);
      throw error;
    }
  }

  private async getNextPosition(clinicId: string): Promise<number> {
    const lastItem = await prisma.queue.findFirst({
      where: { clinicId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    return lastItem ? lastItem.position + 1 : 1;
  }

  async clearCompletedQueue(clinicId: string, olderThanHours: number = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

      const result = await prisma.queue.deleteMany({
        where: {
          clinicId,
          status: "COMPLETED",
          updatedAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(
        `Cleared ${result.count} completed queue items for clinic ${clinicId}`
      );
      return result;
    } catch (error) {
      logger.error("Failed to clear completed queue:", error);
      throw error;
    }
  }
}
