import { Firestore, Timestamp } from "@google-cloud/firestore";
import logger from "../utils/logger.utils";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  clinicId?: string;
  licenseId?: string;
  photoUrl?: string;
  role?: string;
  password?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface Clinic {
  id?: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  phone: string;
  email: string;
  numberOfDoctors?: number | null;
  averageDailyPatients?: number | null;
  isActive?: boolean;
  createdAt?: FirebaseFirestore.Timestamp | string;
  updatedAt?: FirebaseFirestore.Timestamp | string;
}

export interface Patient {
  id: string;
  clinicId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  gender?: string;
  patientNumber?: string;
  dateOfBirth?: Date;
  allergies?: string[];
  isActive?: boolean;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  reason?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  appointmentDate: FirebaseFirestore.Timestamp;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface QueueEntry {
  id?: string;
  patientId: string;
  clinicId: string;
  doctorId?: string;
  status: "WAITING" | "IN_CONSULTATION" | "COMPLETED";
  checkedInAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Consultation {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  prescriptions?: any[];
  labOrders?: any[];
  followUpDate?: Date | null;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface Prescription {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  prescriptions: any[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionData {
  clinicId: string;
  patientId: string;
  doctorId: string;
  prescriptions: any[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Vitals {
  id?: string;
  clinicId: string;
  patientId: string;
  recordedBy: string;
  weight?: number;
  height?: number;
  bmi?: number;
  bloodPressure?: string;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  flags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// FIRESTORE DATABASE SERVICE
// ========================
class DatabaseService {
  private db: Firestore;

  constructor() {
    this.db = new Firestore({
      projectId: process.env.GCP_PROJECT_ID || "team-ehr",
    });
    logger.info("✅ Firestore initialized");
  }

  async createUser(email: string, data: Partial<User>): Promise<User> {
    const userRef = this.db.collection("users").doc();
    const user: User = {
      id: userRef.id,
      email,
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };
    await userRef.set(user);
    return user;
  }

  async createClinic(clinicData: Clinic): Promise<Clinic> {
    const clinicRef = this.db.collection("clinics").doc();

    const newClinic: Clinic = {
      id: clinicRef.id,
      ...clinicData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };

    await clinicRef.set(newClinic);
    logger.info(`Clinic created: ${newClinic.name} (${newClinic.type})`);
    return newClinic;
  }

  async getClinic(clinicId: string): Promise<Clinic | null> {
    const doc = await this.db.collection("clinics").doc(clinicId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Clinic;
  }

  async listClinics(limit = 50): Promise<Clinic[]> {
    const snapshot = await this.db
      .collection("clinics")
      .where("isActive", "==", true)
      .limit(limit)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Clinic)
    );
  }

  async updateClinic(
    clinicId: string,
    data: Partial<Clinic>
  ): Promise<Clinic | null> {
    try {
      const clinicRef = this.db.collection("clinics").doc(clinicId);
      const clinicDoc = await clinicRef.get();
      if (!clinicDoc.exists) return null;

      await clinicRef.update({ ...data, updatedAt: Timestamp.now() });
      const updatedDoc = await clinicRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Clinic;
    } catch (error) {
      logger.error("Error updating clinic:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const snapshot = await this.db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async getUser(userId: string): Promise<User | null> {
    const doc = await this.db.collection("users").doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }

  async updateUser(
    userId: string,
    data: Partial<User>,
    clinicId?: string
  ): Promise<User | null> {
    try {
      const userRef = this.db.collection("users").doc(userId);

      if (clinicId) {
        const user = await userRef.get();
        if (!user.exists || user.data()?.clinicId !== clinicId) return null;
      }

      await userRef.update({ ...data, updatedAt: Timestamp.now() });
      const updatedDoc = await userRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as User;
    } catch (error) {
      logger.error("Error updating user:", error);
      return null;
    }
  }

  async listUsers(
    clinicId: string,
    filters?: { role?: string; isActive?: boolean }
  ): Promise<User[]> {
    try {
      let query = this.db.collection("users").where("clinicId", "==", clinicId);

      if (filters?.role) {
        query = query.where("role", "==", filters.role);
      }

      if (filters?.isActive !== undefined) {
        query = query.where("isActive", "==", filters.isActive);
      }

      const snapshot = await query.orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc) => {
        const { id: _discard, ...data } = doc.data() as User;
        return {
          id: doc.id,
          ...data,
        };
      });
    } catch (error) {
      logger.error("Error listing users:", error);
      return [];
    }
  }

  async createPatient(
    clinicId: string,
    patientData: Partial<Patient>,
    addToQueue: boolean = false
  ) {
    const ref = this.db.collection("patients").doc();

    const newPatient = {
      clinicId,
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await ref.set(newPatient);

    // ✅ Add patient to queue if requested
    if (addToQueue) {
      await this.db.collection("queue").doc(ref.id).set({
        patientId: ref.id,
        clinicId,
        status: "waiting",
        createdAt: new Date(),
      });
    }

    return { id: ref.id, ...newPatient };
  }

  async getPatient(
    patientId: string,
    clinicId: string
  ): Promise<Patient | null> {
    const doc = await this.db.collection("patients").doc(patientId).get();
    if (!doc.exists || doc.data()?.clinicId !== clinicId) return null;
    return { id: doc.id, ...doc.data() } as Patient;
  }

  async listPatients(clinicId: string, limit = 50): Promise<Patient[]> {
    const snapshot = await this.db
      .collection("patients")
      .where("clinicId", "==", clinicId)
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Patient)
    );
  }

  // ===== QUEUE =====
  async addToQueue(patientId: string, clinicId: string) {
    try {
      const queueRef = this.db.collection("patient_queue").doc();
      const entry: QueueEntry = {
        id: queueRef.id,
        patientId,
        clinicId,
        status: "WAITING",
        checkedInAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await queueRef.set(entry);
      return { success: true };
    } catch (error) {
      logger.error("Error adding to queue:", error);
      return { success: false, error };
    }
  }

  async updateQueueStatus(queueId: string, status: QueueEntry["status"]) {
    try {
      await this.db.collection("patient_queue").doc(queueId).update({
        status,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      logger.error("Error updating queue status:", error);
      return { success: false, error };
    }
  }

  async getQueue(clinicId: string): Promise<QueueEntry[]> {
    try {
      const snapshot = await this.db
        .collection("patient_queue")
        .where("clinicId", "==", clinicId)
        .orderBy("checkedInAt", "asc")
        .get();

      // Explicitly cast each doc to QueueEntry
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<QueueEntry, "id">), // cast the rest
      }));
    } catch (error) {
      logger.error("Error getting queue:", error);
      return [];
    }
  }

  // ===== APPOINTMENTS =====
  async createAppointment(
    clinicId: string,
    data: Partial<Appointment>
  ): Promise<Appointment> {
    const appointmentRef = this.db.collection("appointments").doc();
    const appointment: Appointment = {
      id: appointmentRef.id,
      clinicId,
      patientId: data.patientId!,
      doctorId: data.doctorId,
      reason: data.reason || "",
      status: data.status || "scheduled",
      appointmentDate: data.appointmentDate || Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await appointmentRef.set(appointment);
    return appointment;
  }

  async listAppointments(
    clinicId: string,
    status?: string,
    limit = 20
  ): Promise<Appointment[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection("appointments")
      .where("clinicId", "==", clinicId)
      .orderBy("appointmentDate", "desc")
      .limit(limit);

    if (status) query = query.where("status", "==", status);

    const snapshot = await query.get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Appointment)
    );
  }

  // ===== VITALS =====
  async recordVitals(
    patientId: string,
    clinicId: string,
    data: any,
    userId: string
  ) {
    const ref = this.db.collection("vitals").doc();
    const vital = {
      id: ref.id,
      patientId,
      clinicId,
      recordedById: userId,
      ...data,
      createdAt: Timestamp.now(),
    };
    await ref.set(vital);
    return vital;
  }

  async getPatientVitals(patientId: string, clinicId: string, limit = 10) {
    const snapshot = await this.db
      .collection("vitals")
      .where("patientId", "==", patientId)
      .where("clinicId", "==", clinicId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // ===== CONSULTATIONS =====
  async createConsultation(clinicId: string, data: any, doctorId: string) {
    const ref = this.db.collection("consultations").doc();
    const consultation = {
      id: ref.id,
      clinicId,
      doctorId,
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await ref.set(consultation);
    return consultation;
  }

  async listConsultations(
    patientId: string,
    clinicId: string,
    limit = 20
  ): Promise<Consultation[]> {
    const snapshot = await this.db
      .collection("consultations")
      .where("patientId", "==", patientId)
      .where("clinicId", "==", clinicId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const { id: _ignore, ...rest } = doc.data() as Consultation;
      return { id: doc.id, ...rest };
    });
  }

  async createPrescription(data: PrescriptionData) {
    const docRef = this.db.collection("prescriptions").doc();
    const now = new Date();

    const prescription = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(prescription);
    return { id: docRef.id, ...prescription };
  }

  async listPrescriptions(
    patientId: string,
    clinicId: string,
    limit = 20,
    page = 1
  ): Promise<Prescription[]> {
    const snapshot = await this.db
      .collection("prescriptions")
      .where("patientId", "==", patientId)
      .where("clinicId", "==", clinicId)
      .orderBy("createdAt", "desc")
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Prescription, "id">),
    }));
  }

  async createVitals(data: Vitals): Promise<Vitals> {
    const docRef = this.db.collection("vitals").doc();
    await docRef.set(data);
    return { id: docRef.id, ...data };
  }

  // List vitals
  async listVitals(
    patientId: string,
    clinicId: string,
    limit = 10,
    page = 1
  ): Promise<Vitals[]> {
    const snapshot = await this.db
      .collection("vitals")
      .where("patientId", "==", patientId)
      .where("clinicId", "==", clinicId)
      .orderBy("createdAt", "desc")
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Vitals),
    }));
  }

  // Update vitals
  async updateVitals(id: string, data: Partial<Vitals>): Promise<Vitals> {
    const docRef = this.db.collection("vitals").doc(id);
    await docRef.update(data);
    const docSnap = await docRef.get();
    return { id: docSnap.id, ...(docSnap.data() as Vitals) };
  }

  // Get vitals by ID
  async getVitalsById(id: string): Promise<Vitals | null> {
    const docSnap = await this.db.collection("vitals").doc(id).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...(docSnap.data() as Vitals) };
  }

  private generatePatientNumber(): string {
    return `PAT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
  }

  async runTransaction(updateFunction: (transaction: any) => Promise<any>) {
    return this.db.runTransaction(updateFunction);
  }
}

// Export singleton
export const db = new DatabaseService();
export default db;
