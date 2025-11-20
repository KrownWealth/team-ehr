import nodemailer from "nodemailer";
import { config } from "../config/env";
import logger from "../utils/logger.utils";

export class EmailService {
  private transporter;
  private frontendUrl: string;

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

    // Get the first valid frontend URL
    this.frontendUrl = config.frontendUrls[0] || "http://localhost:3000";
  }

  async sendOTPEmail(to: string, otpCode: string): Promise<void> {
    try {
      const verifyUrl = `${
        this.frontendUrl
      }/auth/verify?email=${encodeURIComponent(to)}`;

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Verify Your Email - WeCareEHR",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background-color: #f9f9f9; }
              .otp-code { font-size: 32px; font-weight: bold; color: #2c5aa0; text-align: center; padding: 20px; background-color: white; border-radius: 8px; letter-spacing: 5px; }
              .button { display: inline-block; padding: 12px 30px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <p>Thank you for registering with WeCareEHR.</p>
                <p>Your verification code is:</p>
                <div class="otp-code">${otpCode}</div>
                <p style="text-align: center;">This code will expire in 10 minutes.</p>
                <p style="text-align: center;">Or click the button below to verify your email:</p>
                <div style="text-align: center;">
                  <a href="${verifyUrl}" class="button">Verify Email</a>
                </div>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} WeCareEHR. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
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
      const loginUrl = `${this.frontendUrl}/auth/login`;
      const portalUrl = `${this.frontendUrl}/patient/dashboard`;

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Welcome to WeCareEHR",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background-color: #f9f9f9; }
              .info-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
              .label { font-weight: bold; color: #2c5aa0; }
              .button { display: inline-block; padding: 12px 30px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to WeCareEHR! 🎉</h1>
              </div>
              <div class="content">
                <p>Your patient record has been created successfully.</p>
                
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">Patient Number:</span> ${patientNumber}
                  </div>
                  <div class="info-row">
                    <span class="label">Patient ID:</span> ${patientId}
                  </div>
                </div>

                <p><strong>Please keep this information for your records.</strong></p>
                
                <h3>What's Next?</h3>
                <ul>
                  <li>Access your patient portal to view your medical records</li>
                  <li>Schedule appointments online</li>
                  <li>View your prescriptions and lab results</li>
                  <li>Update your health information</li>
                </ul>

                <div style="text-align: center;">
                  <a href="${portalUrl}" class="button">Access Patient Portal</a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  If you have any questions, please don't hesitate to contact your healthcare provider.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} WeCareEHR. All rights reserved.</p>
                <p>This email was sent to ${to}</p>
              </div>
            </div>
          </body>
          </html>
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
      const PRIMARY_COLOR = "#135d1d";
      const loginUrl = `${this.frontendUrl}/auth/login`;
      const logoUrl = `${this.frontendUrl}/images/logo.png`;

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Staff Invitation - Welcome to WeCareEHR",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Staff Invitation</title>
                <style>
                    /* Global Styles */
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        color: #333333;
                        background-color: #f4f7f6;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                    }
                    /* Header & Branding */
                    .header {
                        background-color: ${PRIMARY_COLOR};
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .logo {
                        max-width: 150px;
                        height: auto;
                        background-color: white; /* Ensure logo is on white background */
                        padding: 5px 15px;
                        border-radius: 8px;
                    }
                    .header h1 {
                        color: white;
                        font-size: 24px;
                        margin-top: 20px;
                        margin-bottom: 0;
                    }

                    /* Content Area */
                    .content {
                        padding: 30px 40px;
                    }
                    .content p {
                        margin-bottom: 20px;
                        font-size: 15px;
                    }

                    /* Credentials Box */
                    .credentials-box {
                        background-color: #e8f5e9; /* Light green background */
                        padding: 25px;
                        border-radius: 8px;
                        margin: 30px 0;
                        border-left: 5px solid ${PRIMARY_COLOR};
                    }
                    .credentials-box h3 {
                        color: ${PRIMARY_COLOR};
                        margin-top: 0;
                        border-bottom: 1px solid #c8e6c9;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .credential-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px dashed #d5d5d5;
                    }
                    .credential-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: 600;
                        color: #555555;
                        min-width: 120px;
                    }
                    .value {
                        font-family: monospace;
                        background-color: #ffffff;
                        padding: 4px 10px;
                        border-radius: 4px;
                        color: ${PRIMARY_COLOR};
                        font-size: 14px;
                        font-weight: bold;
                        word-break: break-all;
                        text-align: right;
                    }

                    /* Call to Action Button */
                    .button-container {
                        text-align: center;
                        margin: 30px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 15px 35px;
                        background-color: ${PRIMARY_COLOR};
                        color: white !important;
                        text-decoration: none;
                        font-weight: bold;
                        border-radius: 8px;
                        font-size: 16px;
                        transition: background-color 0.3s;
                    }
                    .button:hover {
                        background-color: #0d3b14; /* Darker green on hover */
                    }

                    /* Footer */
                    .footer {
                        text-align: center;
                        padding: 20px 40px;
                        color: #999999;
                        font-size: 12px;
                        border-top: 1px solid #eeeeee;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="${logoUrl}" alt="WeCareEHR Logo" class="logo" />
                        <h1>Welcome to the WeCareEHR Team!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${firstName},</p>
                        <p>
                            You have been invited to join the WeCareEHR system as a <strong>${role}</strong>. 
                            Please use the temporary credentials below to log in and activate your account.
                        </p>

                        <div class="credentials-box">
                            <h3>Your Temporary Credentials</h3>
                            <div class="credential-row">
                                <span class="label">Email:</span>
                                <span class="value">${to}</span>
                            </div>
                            <div class="credential-row">
                                <span class="label">Temporary Password:</span>
                                <span class="value">${tempPassword}</span>
                            </div>
                            <div class="credential-row">
                                <span class="label">Assigned Role:</span>
                                <span class="value">${role}</span>
                            </div>
                        </div>
                        
                        <p style="font-weight: bold; color: #cc6600;">
                            ⚠️ Security Notice: For your protection, you will be prompted to change this temporary password immediately upon your first successful login.
                        </p>

                        <div class="button-container">
                            <a href="${loginUrl}" class="button">Go to Login Page</a>
                        </div>

                        <p style="font-size: 14px; color: #666666;">
                            If you did not expect to receive this invitation or have any trouble logging in, 
                            please contact your system administrator immediately.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} WeCareEHR. All rights reserved.</p>
                        <p>This email was intended for ${to}.</p>
                    </div>
                </div>
            </body>
            </html>
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
        .map(
          (p) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
              p.drug
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
              p.dosage
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
              p.frequency
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
              p.duration || "N/A"
            }</td>
          </tr>
        `
        )
        .join("");

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Your Prescription - WeCareEHR",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background-color: #f9f9f9; }
              table { width: 100%; border-collapse: collapse; background-color: white; margin: 20px 0; }
              th { background-color: #2c5aa0; color: white; padding: 12px; text-align: left; }
              .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your Prescription is Ready</h1>
              </div>
              <div class="content">
                <p><strong>Patient Number:</strong> ${patientNumber}</p>
                
                <h3>Prescribed Medications:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${prescriptionList}
                  </tbody>
                </table>

                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul style="margin: 10px 0 0 20px;">
                    <li>Follow the prescribed dosage instructions carefully</li>
                    <li>Complete the full course of medication</li>
                    <li>Do not share your medication with others</li>
                    <li>Contact your doctor if you experience any side effects</li>
                    <li>Store medications properly as directed</li>
                  </ul>
                </div>

                <p style="color: #666; font-size: 14px;">
                  If you have any questions about your prescription, please contact your healthcare provider.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} WeCareEHR. All rights reserved.</p>
                <p>This email was sent to ${to}</p>
              </div>
            </div>
          </body>
          </html>
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
      const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Password Reset - WeCareEHR",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 30px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>We received a request to reset your password for your WeCareEHR account.</p>
                
                <p>Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0 0 20px;">
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Your password won't change until you create a new one</li>
                  </ul>
                </div>

                <p style="color: #666; font-size: 14px;">
                  For security reasons, this link can only be used once. If you need to reset your password again, please request a new link.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} WeCareEHR. All rights reserved.</p>
                <p>This email was sent to ${to}</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      logger.info(`Password reset email sent to: ${to}`);
    } catch (error) {
      logger.error("Failed to send password reset email:", error);
      throw error;
    }
  }
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
