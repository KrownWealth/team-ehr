import { pubsub } from "../config/gcp";
import logger from "../utils/logger.utils";

export class PubSubService {
  async publishPatientRegistered(data: any): Promise<void> {
    try {
      const topic = pubsub.topic("patient-registered");
      const messageBuffer = Buffer.from(JSON.stringify(data));
      await topic.publish(messageBuffer);
      logger.info("Patient registered event published");
    } catch (error) {
      logger.error("Failed to publish patient registered event:", error);
    }
  }

  async publishConsultationCompleted(data: any): Promise<void> {
    try {
      const topic = pubsub.topic("consultation-completed");
      const messageBuffer = Buffer.from(JSON.stringify(data));
      await topic.publish(messageBuffer);
      logger.info("Consultation completed event published");
    } catch (error) {
      logger.error("Failed to publish consultation completed event:", error);
    }
  }

  async publishPaymentReceived(data: any): Promise<void> {
    try {
      const topic = pubsub.topic("payment-received");
      const messageBuffer = Buffer.from(JSON.stringify(data));
      await topic.publish(messageBuffer);
      logger.info("Payment received event published");
    } catch (error) {
      logger.error("Failed to publish payment received event:", error);
    }
  }

  async publishLabResultReady(data: any): Promise<void> {
    try {
      const topic = pubsub.topic("lab-result-ready");
      const messageBuffer = Buffer.from(JSON.stringify(data));
      await topic.publish(messageBuffer);
      logger.info("Lab result ready event published");
    } catch (error) {
      logger.error("Failed to publish lab result ready event:", error);
    }
  }
}
