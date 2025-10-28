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
}
