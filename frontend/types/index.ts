// ============================================================================
// CORE AUTH TYPES
// ============================================================================

export type Role = "ADMIN" | "DOCTOR" | "NURSE" | "CLERK" | "CASHIER" | "PATIENT";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export enum OnboardingStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  clinicId: string;
  phone?: string;
  licenseId?: string;
  photoUrl?: string;
  isActive?: boolean;
  isVerified?: boolean;
  mustChangePassword?: boolean;
  onboardingStatus: OnboardingStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterAdminData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: "CLERK" | "NURSE" | "DOCTOR";
}

export interface VerifyOtpData {
  email?: string;
  phone?: string;
  code: string;
  type?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
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

// ============================================================================
// CLINIC
// ============================================================================

export interface Clinic {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  phone: string;
  email: string;
  numberOfDoctors?: number;
  averageDailyPatients?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface OnboardClinicData {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  phone: string;
  email: string;
  numberOfDoctors?: number;
  averageDailyPatients?: number;
}

// ============================================================================
// PATIENT
// ============================================================================

export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  phone: string;
  email?: string;
  address: string;
  bloodGroup?: BloodGroup;
  allergies?: string[];
  chronicConditions?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  clinicId: string;
}

export interface RegisterPatientData {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  phone: string;
  email?: string;
  address: string;
  bloodGroup?: BloodGroup;
  allergies?: string[];
  chronicConditions?: string[];
}

// ============================================================================
// STAFF
// ============================================================================

export interface Staff extends User {
  specialization?: string;
  department?: string;
}

export interface CreateStaffData {
  email: string;
  role: "DOCTOR" | "NURSE" | "CLERK" | "CASHIER";
  firstName: string;
  lastName: string;
  phone: string;
}

// ============================================================================
// APPOINTMENT
// ============================================================================

export type AppointmentStatus = 
  | "SCHEDULED" 
  | "CHECKED_IN" 
  | "IN_CONSULTATION" 
  | "COMPLETED" 
  | "CANCELLED";

export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
  patient?: Patient;
}

export interface CreateAppointmentData {
  patientId: string;
  appointmentDate: string;
  reason: string;
  notes?: string;
}

export interface AppointmentSummary {
  total: number;
  scheduled: number;
  checkedIn: number;
  inConsultation: number;
  completed: number;
  cancelled: number;
}

// ============================================================================
// QUEUE
// ============================================================================

export type QueueStatus = "WAITING" | "IN_CONSULTATION" | "COMPLETED";

export interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  priority: number; // 0-5
  status: QueueStatus;
  position: number;
  createdAt: string;
}

export interface AddToQueueData {
  patientId: string;
  priority?: number;
}

// ============================================================================
// VITALS
// ============================================================================

export interface Vitals {
  id: string;
  patientId: string;
  recordedById: string;
  bloodPressure: string; // Format: "120/80"
  temperature?: number; // Celsius
  pulse?: number; // bpm
  weight?: number; // kg
  height?: number; // cm
  bmi?: number; // Auto-calculated
  respiratoryRate?: number;
  spo2?: number; // Oxygen saturation %
  bloodGlucose?: number; // mg/dL
  flags?: string[]; // Abnormal flags
  notes?: string;
  createdAt: string;
  patient?: Patient;
  recordedBy?: User;
}

export interface RecordVitalsData {
  patientId: string;
  bloodPressure: string;
  temperature?: number;
  pulse?: number;
  weight?: number;
  height?: number;
  respiratoryRate?: number;
  spo2?: number;
  bloodGlucose?: number;
  notes?: string;
}

export interface VitalAlerts {
  critical: string[];
  warnings: string[];
  hasCritical: boolean;
  hasWarnings: boolean;
  totalAlerts: number;
}

// ============================================================================
// CONSULTATION
// ============================================================================

export interface Consultation {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions?: Medication[];
  labOrders?: string[];
  followUpDate?: string;
  createdAt: string;
  updatedAt?: string;
  patient?: Patient;
  doctor?: User;
}

export interface CreateConsultationData {
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions?: Medication[];
  labOrders?: string[];
  followUpDate?: string;
}

// ============================================================================
// MEDICATION & PRESCRIPTION
// ============================================================================

export interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  consultationId?: string;
  prescriptions: Medication[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  patient?: Patient;
  doctor?: User;
}

export interface CreatePrescriptionData {
  patientId: string;
  consultationId?: string;
  prescriptions: Medication[];
  notes?: string;
}

export interface AllergyConflict {
  drug: string;
  allergy: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface AllergyCheckResult {
  hasConflicts: boolean;
  conflicts: AllergyConflict[];
  allergies: string[];
  patientName: string;
}

// ============================================================================
// AI FEATURES
// ============================================================================

export interface DiagnosisSuggestion {
  condition: string;
  probability: "high" | "medium" | "low";
  reasoning: string;
  icd10_code?: string;
}

export interface AIDiagnosisRequest {
  patientId: string;
  symptoms: string;
  chiefComplaint: string;
}

export interface AIDiagnosisResponse {
  patient_context: {
    demographics: {
      age: number;
      gender: string;
      bloodGroup?: string;
    };
    chronic_conditions: string[];
    allergies: string[];
    recent_vitals: any[];
    medical_history: any[];
  };
  ai_suggestions: {
    differential_diagnoses: DiagnosisSuggestion[];
    recommended_tests: string[];
    red_flags: string[];
    management_suggestions: string[];
    follow_up?: string;
  };
  generated_at: string;
  disclaimer: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "major" | "moderate" | "minor";
  description: string;
  current_medication?: string;
  proposed_medication?: string;
}

export interface DrugInteractionRequest {
  patientId: string;
  proposedMedications: string[];
}

export interface DrugInteractionResponse {
  current_medications: Medication[];
  proposed_medications: string[];
  patient_allergies: string[];
  interactions: DrugInteraction[];
  safe_to_prescribe: boolean;
  warning?: string;
}

export interface VitalsTrend {
  status: string;
  trend: "increasing" | "decreasing" | "stable";
  change_percent: string;
  average_first_half: string;
  average_last_half: string;
}

export interface VitalsTrendsResponse {
  period_days: number;
  readings_count: number;
  trends: {
    blood_pressure?: VitalsTrend;
    temperature?: VitalsTrend;
    weight?: VitalsTrend;
    bmi?: VitalsTrend;
  };
  latest_reading: Vitals;
  analysis_date: string;
}

export interface RiskAssessment {
  cardiovascular_risk: {
    score: number;
    level: "high" | "moderate" | "low";
    factors: string[];
  };
  diabetes_risk: {
    score: number;
    level: "high" | "moderate" | "low" | "diagnosed";
  };
  general_health_score: number;
  recommendations: string[];
  assessed_at: string;
}

// ============================================================================
// PATIENT PORTAL
// ============================================================================

export interface PatientDashboard {
  patient_info: {
    id: string;
    patientNumber: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    birthDate: string;
    age: number;
    bloodGroup?: string;
    allergies: string[];
    chronicConditions: string[];
  };
  health_summary: {
    latest_vitals?: Vitals;
    critical_alerts: string[];
    warnings: string[];
  };
  upcoming_appointments: Appointment[];
  recent_vitals: Vitals[];
  recent_consultations: Consultation[];
}

export interface MedicationReminder {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  prescribed_date: string;
  prescribed_by: string;
}

export interface HealthTip {
  personalized_tips: string[];
  educational_resources: Array<{
    title: string;
    url: string;
  }>;
  general_wellness: {
    message: string;
  };
}

// ============================================================================
// SYSTEM
// ============================================================================

export interface SystemRole {
  name: Role;
  description: string;
  permissions: string[];
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

export interface DrugInfo {
  name: string;
  genericName: string;
  category: string;
  commonDosages: string[];
  route: string;
  cautions: string[];
}

export interface LabParameter {
  name: string;
  unit: string;
  normalRange?: {
    min?: number;
    max?: number;
    male?: { min: number; max: number };
    female?: { min: number; max: number };
  };
  prediabetes?: { min: number; max: number };
  diabetes?: { min: number };
}

export interface LabTest {
  test: string;
  parameters: LabParameter[];
}

// ============================================================================
// DASHBOARD & STATS
// ============================================================================

export interface DashboardStats {
  totalPatients: number;
  totalStaff: number;
  todayAppointments: number;
  pendingBills: number;
  todayRevenue: number;
}

// ============================================================================
// SYNC (OFFLINE SUPPORT)
// ============================================================================

export type SyncAction = "CREATE" | "UPDATE" | "DELETE";

export type SyncEntity = "patient" | "vitals" | "consultation" | "bill" | "appointment";

export interface PendingAction {
  action: SyncAction;
  entity: SyncEntity;
  entityId: string;
  data: any;
  timestamp: string;
  clientId: string;
}

export interface ProcessedAction {
  clientId: string;
  success: boolean;
  conflict: boolean;
  serverId?: string;
  message: string;
}

export interface SyncRequest {
  lastSyncTimestamp?: string;
  pendingActions: PendingAction[];
}

export interface SyncResponse {
  processedActions: ProcessedAction[];
  serverUpdates: {
    patients: Patient[];
    vitals: Vitals[];
    consultations: Consultation[];
    bills: any[];
    appointments: Appointment[];
  };
  lastSyncTimestamp: string;
}

export interface SyncStatus {
  hasUpdates: boolean;
  updateCounts: {
    patients: number;
    vitals: number;
    consultations: number;
    bills: number;
    appointments: number;
  };
  lastSyncTimestamp: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  status: "error";
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  status: "success";
  message?: string;
  data: {
    items?: T[];
    patients?: Patient[];
    vitals?: Vitals[];
    consultations?: Consultation[];
    appointments?: Appointment[];
    pagination: PaginationMeta;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

// ============================================================================
// LEGACY/DEPRECATED (Keep for backwards compatibility, remove gradually)
// ============================================================================

/**
 * @deprecated Use lowercase gender values from Gender type
 */
export type LegacyGender = "Male" | "Female" | "Other";
