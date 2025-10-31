import { safeFirestore as firestore } from "../config/gcp";
import logger from "../utils/logger.utils";

export class QueueService {
  private queueCollection = firestore.collection("patient_queue");

  async addToQueue(
    patientId: string,
    patientName: string,
    clinicId: string,
    priority: number = 0
  ) {
    try {
      const queueItem = {
        patientId,
        patientName,
        clinicId,
        priority,
        status: "WAITING",
        checkedInAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await this.queueCollection.add(queueItem);
      logger.info(`Patient added to queue: ${patientId}`);
      return { id: docRef.id, ...queueItem };
    } catch (error) {
      logger.error("Failed to add to queue:", error);
      throw error;
    }
  }

  async getClinicQueue(clinicId: string) {
    try {
      const snapshot = await this.queueCollection
        .where("clinicId", "==", clinicId)
        .where("status", "in", ["WAITING", "IN_CONSULTATION"])
        .orderBy("priority", "desc")
        .orderBy("checkedInAt", "asc")
        .get();

      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error("Failed to get clinic queue:", error);
      throw error;
    }
  }

  async updateQueueStatus(queueId: string, status: string) {
    try {
      await this.queueCollection.doc(queueId).update({
        status,
        updatedAt: new Date(),
      });
      logger.info(`Queue status updated: ${queueId} -> ${status}`);
    } catch (error) {
      logger.error("Failed to update queue status:", error);
      throw error;
    }
  }

  listenToQueue(clinicId: string, callback: (queue: any[]) => void) {
    return this.queueCollection
      .where("clinicId", "==", clinicId)
      .where("status", "in", ["WAITING", "IN_CONSULTATION"])
      .onSnapshot((snapshot: any) => {
        const queue = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(queue);
      });
  }
}
