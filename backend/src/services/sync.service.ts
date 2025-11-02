import prisma from "../config/database";
import logger from "../utils/logger.utils";
import { Prisma } from "@prisma/client";

export interface SyncAction {
  clientId: string; // Client-generated UUID for tracking
  type:
    | "CREATE_PATIENT"
    | "UPDATE_PATIENT"
    | "RECORD_VITALS"
    | "CREATE_CONSULTATION"
    | "UPDATE_CONSULTATION"
    | "CREATE_BILL"
    | "RECORD_PAYMENT"
    | "CREATE_APPOINTMENT"
    | "UPDATE_APPOINTMENT";
  data: any;
  timestamp: string; // ISO timestamp when action was created on client
}

export interface SyncResult {
  clientId: string;
  success: boolean;
  serverId?: string; // ID of created/updated record on server
  error?: string;
  conflict?: boolean;
}

export interface SyncResponse {
  processedActions: SyncResult[];
  serverUpdates: {
    patients: any[];
    vitals: any[];
    consultations: any[];
    bills: any[];
    appointments: any[];
  };
  lastSyncTimestamp: string;
}

export class SyncService {
  /**
   * Process offline actions from client and return server updates
   */
  async processSync(
    clinicId: string,
    userId: string,
    lastSyncTimestamp: string | null,
    pendingActions: SyncAction[]
  ): Promise<SyncResponse> {
    const results: SyncResult[] = [];
    const processedTimestamp = new Date().toISOString();

    // Process each pending action
    for (const action of pendingActions) {
      const result = await this.processAction(clinicId, userId, action);
      results.push(result);
    }

    // Fetch server updates since last sync
    const serverUpdates = await this.fetchServerUpdates(
      clinicId,
      lastSyncTimestamp
    );

    return {
      processedActions: results,
      serverUpdates,
      lastSyncTimestamp: processedTimestamp,
    };
  }

  /**
   * Process a single sync action
   */
  private async processAction(
    clinicId: string,
    userId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    try {
      logger.info(
        `Processing sync action: ${action.type} (${action.clientId})`
      );

      switch (action.type) {
        case "CREATE_PATIENT":
          return await this.createPatient(clinicId, action);

        case "UPDATE_PATIENT":
          return await this.updatePatient(clinicId, action);

        case "RECORD_VITALS":
          return await this.recordVitals(clinicId, userId, action);

        case "CREATE_CONSULTATION":
          return await this.createConsultation(clinicId, userId, action);

        case "UPDATE_CONSULTATION":
          return await this.updateConsultation(clinicId, userId, action);

        case "CREATE_BILL":
          return await this.createBill(clinicId, action);

        case "RECORD_PAYMENT":
          return await this.recordPayment(clinicId, action);

        case "CREATE_APPOINTMENT":
          return await this.createAppointment(action);

        case "UPDATE_APPOINTMENT":
          return await this.updateAppointment(action);

        default:
          return {
            clientId: action.clientId,
            success: false,
            error: `Unknown action type: ${action.type}`,
          };
      }
    } catch (error: any) {
      logger.error(`Failed to process action ${action.clientId}:`, error);

      // Check for conflict (Prisma unique constraint violation)
      if (error.code === "P2002") {
        return {
          clientId: action.clientId,
          success: false,
          conflict: true,
          error: "Record already exists - conflict detected",
        };
      }

      return {
        clientId: action.clientId,
        success: false,
        error: error.message,
      };
    }
  }

  private async createPatient(
    clinicId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    const { generatePatientNumber } = await import("../utils/helpers.utils");
    const patientCount = await prisma.patient.count({ where: { clinicId } });
    const patientNumber = generatePatientNumber(patientCount);

    const patient = await prisma.patient.create({
      data: {
        ...action.data,
        clinicId,
        patientNumber,
        birthDate: new Date(action.data.birthDate),
      },
    });

    return {
      clientId: action.clientId,
      success: true,
      serverId: patient.id,
    };
  }

  private async updatePatient(
    clinicId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    const { serverId, ...updateData } = action.data;

    const result = await prisma.patient.updateMany({
      where: { id: serverId, clinicId },
      data: updateData,
    });

    if (result.count === 0) {
      return {
        clientId: action.clientId,
        success: false,
        error: "Patient not found or unauthorized",
      };
    }

    return {
      clientId: action.clientId,
      success: true,
      serverId,
    };
  }

  private async recordVitals(
    clinicId: string,
    userId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    const { calculateBMI, checkVitalFlags } = await import(
      "../utils/helpers.utils"
    );

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: action.data.patientId, clinicId },
    });

    if (!patient) {
      return {
        clientId: action.clientId,
        success: false,
        error: "Patient not found in this clinic",
      };
    }

    let bmi = null;
    if (action.data.weight && action.data.height) {
      bmi = calculateBMI(action.data.weight, action.data.height);
    }

    const flags = checkVitalFlags(action.data);

    const vitals = await prisma.vitals.create({
      data: {
        patientId: action.data.patientId,
        recordedById: userId,
        ...action.data,
        bmi,
        flags,
      },
    });

    return {
      clientId: action.clientId,
      success: true,
      serverId: vitals.id,
    };
  }

  private async createConsultation(
    clinicId: string,
    userId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: action.data.patientId, clinicId },
    });

    if (!patient) {
      return {
        clientId: action.clientId,
        success: false,
        error: "Patient not found in this clinic",
      };
    }

    const consultation = await prisma.consultation.create({
      data: {
        clinicId,
        patientId: action.data.patientId,
        doctorId: userId,
        subjective: action.data.subjective,
        objective: action.data.objective,
        assessment: action.data.assessment,
        plan: action.data.plan,
        prescriptions: action.data.prescriptions || [],
        labOrders: action.data.labOrders || [],
        followUpDate: action.data.followUpDate
          ? new Date(action.data.followUpDate)
          : null,
      },
    });

    return {
      clientId: action.clientId,
      success: true,
      serverId: consultation.id,
    };
  }

  private async updateConsultation(
    clinicId: string,
    userId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    const { serverId, ...updateData } = action.data;

    const result = await prisma.consultation.updateMany({
      where: { id: serverId, clinicId, doctorId: userId },
      data: updateData,
    });

    if (result.count === 0) {
      return {
        clientId: action.clientId,
        success: false,
        error: "Consultation not found or unauthorized",
      };
    }

    return {
      clientId: action.clientId,
      success: true,
      serverId,
    };
  }

  private async createBill(
    clinicId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    const { generateBillNumber } = await import("../utils/helpers.utils");

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
        clinicId,
        patientId: action.data.patientId,
        billNumber,
        items: action.data.items,
        totalAmount: action.data.totalAmount,
        balance: action.data.totalAmount,
        notes: action.data.notes,
      },
    });

    return {
      clientId: action.clientId,
      success: true,
      serverId: bill.id,
    };
  }

  private async recordPayment(
    clinicId: string,
    action: SyncAction
  ): Promise<SyncResult> {
    const bill = await prisma.bill.findFirst({
      where: { id: action.data.billId, clinicId },
    });

    if (!bill) {
      return {
        clientId: action.clientId,
        success: false,
        error: "Bill not found in this clinic",
      };
    }

    const newAmountPaid = bill.amountPaid + action.data.amount;
    const newBalance = bill.totalAmount - newAmountPaid;
    const newStatus = newBalance <= 0 ? "PAID" : "PARTIAL";

    await prisma.bill.update({
      where: { id: action.data.billId },
      data: {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
        paymentMethod: action.data.paymentMethod,
        paymentDate: new Date(),
      },
    });

    return {
      clientId: action.clientId,
      success: true,
      serverId: action.data.billId,
    };
  }

  private async createAppointment(action: SyncAction): Promise<SyncResult> {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: action.data.patientId,
        appointmentDate: new Date(action.data.appointmentDate),
        reason: action.data.reason,
        notes: action.data.notes,
        status: action.data.status || "SCHEDULED",
      },
    });

    return {
      clientId: action.clientId,
      success: true,
      serverId: appointment.id,
    };
  }

  private async updateAppointment(action: SyncAction): Promise<SyncResult> {
    const { serverId, ...updateData } = action.data;

    const result = await prisma.appointment.updateMany({
      where: { id: serverId },
      data: updateData,
    });

    if (result.count === 0) {
      return {
        clientId: action.clientId,
        success: false,
        error: "Appointment not found",
      };
    }

    return {
      clientId: action.clientId,
      success: true,
      serverId,
    };
  }

  /**
   * Fetch all records updated since last sync timestamp
   */
  private async fetchServerUpdates(
    clinicId: string,
    lastSyncTimestamp: string | null
  ) {
    const since = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);

    const [patients, vitals, consultations, bills, appointments] =
      await Promise.all([
        prisma.patient.findMany({
          where: {
            clinicId,
            updatedAt: { gt: since },
          },
          orderBy: { updatedAt: "asc" },
        }),

        prisma.vitals.findMany({
          where: {
            patient: { clinicId },
            updatedAt: { gt: since },
          },
          orderBy: { updatedAt: "asc" },
        }),

        prisma.consultation.findMany({
          where: {
            clinicId,
            updatedAt: { gt: since },
          },
          orderBy: { updatedAt: "asc" },
        }),

        prisma.bill.findMany({
          where: {
            clinicId,
            updatedAt: { gt: since },
          },
          orderBy: { updatedAt: "asc" },
        }),

        prisma.appointment.findMany({
          where: {
            patient: { clinicId },
            updatedAt: { gt: since },
          },
          orderBy: { updatedAt: "asc" },
        }),
      ]);

    return {
      patients,
      vitals,
      consultations,
      bills,
      appointments,
    };
  }
}
