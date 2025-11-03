import nodemailer from "nodemailer";
import { config } from "../config/env";
import logger from "../utils/logger.utils";

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendOTPEmail(to: string, otpCode: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Verify Your Email - WeCareEHR",
        html: `
          
            Email Verification
            Thank you for registering with WeCareEHR.
            Your verification code is:
            
              ${otpCode}
            
            This code will expire in 10 minutes.
            
              If you didn't request this, please ignore this email.
            
          
        `,
      });
      logger.info(`OTP email sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send OTP email:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(
    to: string,
    patientId: string,
    patientNumber: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Welcome to WeCareEHR",
        html: `
          
            Welcome to WeCareEHR!
            Your patient record has been created successfully.
            
              Patient Number: ${patientNumber}
              Patient ID: ${patientId}
            
            Please keep this information for your records.
          
        `,
      });
      logger.info(`Welcome email sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send welcome email:", error);
      throw error;
    }
  }

  async sendStaffInvitationEmail(
    to: string,
    firstName: string,
    tempPassword: string,
    role: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Staff Invitation - WeCareEHR",
        html: `
          
            Welcome to WeCareEHR Team!
            Hi ${firstName},
            You have been added as a ${role} to WeCareEHR.
            
              Email: ${to}
              Temporary Password: ${tempPassword}
            
            Important: Please change your password after your first login.
            
              Login Now
            
          
        `,
      });
      logger.info(`Staff invitation sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send staff invitation:", error);
      throw error;
    }
  }

  async sendPrescriptionEmail(
    to: string,
    prescriptions: any[],
    patientNumber: string
  ): Promise<void> {
    try {
      const prescriptionList = prescriptions
        .map((p) => `${p.drug} - ${p.dosage} (${p.frequency})`)
        .join("");

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Your Prescription - WeCareEHR",
        html: `
          
            Your Prescription is Ready
            Patient Number: ${patientNumber}
            Prescribed Medications:
            
              ${prescriptionList}
            
            
              
                ⚠️ Important: Follow the prescribed dosage instructions carefully.
              
            
          
        `,
      });
      logger.info(`Prescription email sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send prescription email:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Password Reset - WeCareEHR",
        html: `
          
            Password Reset Request
            We received a request to reset your password.
            
              Reset Password
            
            This link will expire in 1 hour.
          
        `,
      });
      logger.info(`Password reset email sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send password reset email:", error);
      throw error;
    }
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(
    to: string,
    firstName: string,
    appointmentDate: Date,
    reason?: string
  ): Promise<void> {
    try {
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Appointment Confirmation - WeCareEHR",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Appointment Confirmed</h2>
          <p>Dear ${firstName},</p>
          <p>Your appointment has been successfully scheduled.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
            ${
              reason
                ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>`
                : ""
            }
          </div>
          
          <p><strong>Important Reminders:</strong></p>
          <ul>
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring your patient ID card or number</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
          </ul>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from WeCareEHR. Please do not reply to this email.
          </p>
        </div>
      `,
      });
      logger.info(`Appointment confirmation sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send appointment confirmation:", error);
      throw error;
    }
  }

  /**
   * Send appointment cancellation email
   */
  async sendAppointmentCancellation(
    to: string,
    firstName: string,
    appointmentDate: Date,
    reason?: string
  ): Promise<void> {
    try {
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Appointment Cancelled - WeCareEHR",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Appointment Cancelled</h2>
          <p>Dear ${firstName},</p>
          <p>Your appointment has been cancelled.</p>
          
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
            ${
              reason
                ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>`
                : ""
            }
          </div>
          
          <p>If you would like to reschedule, please contact us or book a new appointment.</p>
          
          <p>We apologize for any inconvenience this may cause.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from WeCareEHR. Please do not reply to this email.
          </p>
        </div>
      `,
      });
      logger.info(`Appointment cancellation sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send appointment cancellation:", error);
      throw error;
    }
  }

  /**
   * Send appointment reminder email (run as scheduled task)
   */
  async sendAppointmentReminder(
    to: string,
    firstName: string,
    appointmentDate: Date,
    reason?: string
  ): Promise<void> {
    try {
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Appointment Reminder - WeCareEHR",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Appointment Reminder</h2>
          <p>Dear ${firstName},</p>
          <p>This is a reminder about your upcoming appointment.</p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
            ${
              reason
                ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>`
                : ""
            }
          </div>
          
          <p><strong>Please remember to:</strong></p>
          <ul>
            <li>Arrive 15 minutes early</li>
            <li>Bring your patient ID</li>
            <li>Bring any relevant medical documents</li>
          </ul>
          
          <p>See you soon!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated reminder from WeCareEHR. Please do not reply to this email.
          </p>
        </div>
      `,
      });
      logger.info(`Appointment reminder sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send appointment reminder:", error);
      throw error;
    }
  }
}
