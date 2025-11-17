import { Role } from "@/lib/constants/roles";

export interface Meta {
  size: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  currentPage: number;
  offset: number;
  totalItems: number;
  nextPage: number | null;
  previousPage: number | null;
}

export interface ResponseSuccess<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Meta;
}

export interface ResponseError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  clinicId: string;
  photoUrl?: string;
  phone?: string;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  clinicId: string;
  exp: number;
  iat: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Clinic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logoUrl?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  upi: string; // Unique Patient ID
  firstName: string;
  lastName: string;
  otherNames?: string;
  gender: "Male" | "Female" | "Other";
  birthDate: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  nationalId?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  registrationDate: string;
  status: "active" | "inactive";
  clinicId: string;
}

export interface QueueItem {
  id: string;
  queueNumber: number;
  patientId: string;
  patient: Patient;
  visitType: "New" | "Follow-up" | "Emergency";
  priority: "Normal" | "Urgent" | "Emergency";
  status: "Waiting" | "Vitals" | "Consultation" | "Completed" | "Cancelled";
  chiefComplaint?: string;
  addedBy: string;
  addedAt: string;
  completedAt?: string;
  clinicId: string;
}

export interface Vitals {
  id: string;
  patientId: string;
  recordedBy: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  pulse?: number;
  respirationRate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  notes?: string;
  recordedAt: string;
  clinicId: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  doctor: User;
  queueId?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosis?: string[];
  consultationDate: string;
  followUpDate?: string;
  status: "In Progress" | "Completed";
  clinicId: string;
}

export interface Medication {
  drugName: string;
  strength: string;
  form: "Tablet" | "Syrup" | "Injection" | "Cream" | "Drops" | "Inhaler";
  frequency: "OD" | "BD" | "TDS" | "QID" | "PRN";
  route: "Oral" | "IV" | "IM" | "Topical" | "Sublingual";
  duration: number;
  quantity: number;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: User;
  consultationId?: string;
  medications: Medication[];
  notes?: string;
  prescribedDate: string;
  status: "Active" | "Completed" | "Cancelled";
  clinicId: string;
}

export interface Staff extends User {
  specialization?: string;
  licenseNumber?: string;
  department?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  doctorId: string;
  testName: string;
  status: "Pending" | "In Progress" | "Completed";
  orderedAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayCheckIns: number;
  queueLength: number;
  pendingVitals: number;
  pendingConsultations: number;
  revenue?: number;
  staffCount?: number;
}

export type ApiError = {
  message: string;
  error: string;
  statusCode: number;
};
