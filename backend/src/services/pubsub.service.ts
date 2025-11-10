import { EmailService } from "./email.service";
import { safePubSub } from "../config/gcp";
import logger from "../utils/logger.utils";
import { Subscription } from "@google-cloud/pubsub";

const emailService = new EmailService();

export class PubSubService {
  private topicName = "appointment-notifications";
  private pubsub = safePubSub;

  /**
   * Publish appointment scheduled event
   */
  async publishAppointmentScheduled(data: {
    appointmentId: string;
    patientEmail: string;
    patientFirstName: string;
    appointmentDate: Date;
    reason?: string;
  }) {
    await this.publishEvent(
      { ...data, type: "appointment_scheduled" },
      "scheduled"
    );
  }

  /**
   * Publish appointment cancelled event
   */
  async publishAppointmentCancelled(data: {
    appointmentId: string;
    patientEmail: string;
    patientFirstName: string;
    appointmentDate: Date;
    reason?: string;
  }) {
    await this.publishEvent(
      { ...data, type: "appointment_cancelled" },
      "cancelled"
    );
  }

  /**
   * Publish appointment reminder event
   */
  async publishAppointmentReminder(data: {
    appointmentId: string;
    patientEmail: string;
    patientFirstName: string;
    appointmentDate: Date;
    reason?: string;
  }) {
    await this.publishEvent(
      { ...data, type: "appointment_reminder" },
      "reminder"
    );
  }

  /**
   * Generic publish method
   */
  private async publishEvent(
    data: {
      type: string;
      appointmentId: string;
      patientEmail: string;
      patientFirstName: string;
      appointmentDate: Date;
      reason?: string;
    },
    fallbackType: "scheduled" | "cancelled" | "reminder"
  ) {
    try {
      if (!this.pubsub) {
        logger.warn("Pub/Sub not available, sending email directly");
        await this.sendAppointmentEmailDirectly(data, fallbackType);
        return;
      }

      const dataBuffer = Buffer.from(
        JSON.stringify({ ...data, timestamp: new Date().toISOString() })
      );
      await this.pubsub
        .topic(this.topicName)
        .publishMessage({ data: dataBuffer });
      logger.info(`Appointment event published: ${data.appointmentId}`);
    } catch (err) {
      logger.error(`Failed to publish ${fallbackType} event:`, err);
      await this.sendAppointmentEmailDirectly(data, fallbackType);
    }
  }

  /**
   * Fallback: send email directly
   */
  private async sendAppointmentEmailDirectly(
    data: {
      patientEmail: string;
      patientFirstName: string;
      appointmentDate: Date;
      reason?: string;
    },
    type: "scheduled" | "cancelled" | "reminder"
  ) {
    try {
      switch (type) {
        case "scheduled":
          await emailService.sendAppointmentConfirmation(
            data.patientEmail,
            data.patientFirstName,
            data.appointmentDate,
            data.reason
          );
          break;
        case "cancelled":
          await emailService.sendAppointmentCancellation(
            data.patientEmail,
            data.patientFirstName,
            data.appointmentDate,
            data.reason
          );
          break;
        case "reminder":
          await emailService.sendAppointmentReminder(
            data.patientEmail,
            data.patientFirstName,
            data.appointmentDate,
            data.reason
          );
          break;
      }
      logger.info(`Direct email sent: ${type}`);
    } catch (err) {
      logger.error(`Failed to send ${type} email:`, err);
    }
  }

  /**
   * Subscribe to appointment notifications
   */
  async subscribeToAppointmentNotifications() {
    if (!this.pubsub) {
      logger.warn("Cannot subscribe: Pub/Sub not initialized");
      return;
    }

    const subscriptionName = "appointment-notifications-sub";

    try {
      const subscription: Subscription = this.pubsub
        .topic(this.topicName)
        .subscription(subscriptionName);

      subscription.on("message", async (message) => {
        try {
          const data = JSON.parse(message.data.toString());

          switch (data.type) {
            case "appointment_scheduled":
              await emailService.sendAppointmentConfirmation(
                data.patientEmail,
                data.patientFirstName,
                new Date(data.appointmentDate),
                data.reason
              );
              break;
            case "appointment_cancelled":
              await emailService.sendAppointmentCancellation(
                data.patientEmail,
                data.patientFirstName,
                new Date(data.appointmentDate),
                data.reason
              );
              break;
            case "appointment_reminder":
              await emailService.sendAppointmentReminder(
                data.patientEmail,
                data.patientFirstName,
                new Date(data.appointmentDate),
                data.reason
              );
              break;
          }

          message.ack();
        } catch (err) {
          logger.error("Error processing message:", err);
          message.nack();
        }
      });

      subscription.on("error", (err) => {
        logger.error("Subscription error:", err);
      });

      logger.info("Subscribed to appointment notifications");
    } catch (err) {
      logger.error("Failed to subscribe:", err);
    }
  }
}

export const pubsubService = new PubSubService();
