import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const patientRegistrationSchema = z.object({
  nationalId: z.string().optional(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  otherNames: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  birthDate: z.string().min(1, "Birth date is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const vitalsSchema = z.object({
  bloodPressureSystolic: z.number().min(50).max(300).optional(),
  bloodPressureDiastolic: z.number().min(30).max(200).optional(),
  temperature: z.number().min(30).max(45).optional(),
  pulse: z.number().min(30).max(220).optional(),
  respirationRate: z.number().min(5).max(60).optional(),
  weight: z.number().min(1).max(500).optional(),
  height: z.number().min(30).max(250).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  bloodGlucose: z.number().min(0).max(1000).optional(),
  notes: z.string().optional(),
});

export const consultationSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  subjective: z
    .string()
    .min(10, "Chief complaint must be at least 10 characters"),
  objective: z.string().min(5, "Physical exam findings required"),
  assessment: z.string().min(5, "Diagnosis required"),
  plan: z.string().min(10, "Treatment plan required"),
  diagnosis: z.array(z.string()).optional(),
  followUpDate: z.string().optional(),
});

export const staffInviteSchema = z.object({
  email: z.email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["CLERK", "NURSE", "DOCTOR", "LAB_TECH", "CASHIER"]),
});

export const queueEntrySchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  visitType: z.enum(["New", "Follow-up", "Emergency"]),
  priority: z.enum(["Normal", "Urgent", "Emergency"]),
  chiefComplaint: z.string().optional(),
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneSchema = z
  .string()
  .regex(/^(\+?234|0)[789]\d{9}$/, "Invalid Nigerian phone number");
