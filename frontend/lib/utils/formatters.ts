import { format, parseISO, formatDistanceToNow } from "date-fns";
import { siteConfig } from "../siteConfig";

export function formatDate(date: string | Date, formatStr?: string): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr || siteConfig.dateFormats.display);
  } catch {
    return "Invalid date";
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, siteConfig.dateFormats.displayWithTime);
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birth = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("234")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      9
    )} ${cleaned.slice(9)}`;
  }

  if (cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

export function formatFullName(
  firstName: string,
  lastName: string,
  otherNames?: string
): string {
  const names = [firstName, otherNames, lastName].filter(Boolean);
  return names.join(" ");
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatBloodPressure(
  systolic?: number,
  diastolic?: number
): string {
  if (!systolic || !diastolic) return "N/A";
  return `${systolic}/${diastolic} mmHg`;
}

export function formatTemperature(temp?: number): string {
  if (!temp) return "N/A";
  return `${temp.toFixed(1)}°C`;
}

export function getVitalsStatus(
  value: number,
  type: keyof typeof siteConfig.vitalsThresholds
): "normal" | "warning" | "critical" {
  const thresholds = siteConfig.vitalsThresholds[type];

  if (!thresholds || typeof thresholds !== "object") return "normal";

  if ("normal" in thresholds && Array.isArray(thresholds.normal)) {
    const [normalMin, normalMax] = thresholds.normal;
    const [warningMin, warningMax] = thresholds.warning || [0, 0];
    const [criticalMin] = thresholds.critical || [0];

    if (value >= normalMin && value <= normalMax) return "normal";
    if (
      (value >= warningMin && value < normalMin) ||
      (value > normalMax && value <= warningMax)
    )
      return "warning";
    if (value >= criticalMin || value < warningMin) return "critical";
  }

  return "normal";
}

export function getBloodPressureStatus(
  systolic: number,
  diastolic: number
): "normal" | "warning" | "critical" {
  const sysStatus = getVitalsStatus(systolic, "bloodPressure");
  const diaStatus = getVitalsStatus(diastolic, "bloodPressure");

  if (sysStatus === "critical" || diaStatus === "critical") return "critical";
  if (sysStatus === "warning" || diaStatus === "warning") return "warning";
  return "normal";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function generatePatientId(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `PT${year}${random}`;
}
