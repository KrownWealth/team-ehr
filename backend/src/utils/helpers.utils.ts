export const generatePatientNumber = (count: number): string => {
  return `PAT-${String(count + 1).padStart(5, "0")}`;
};

export const generateBillNumber = (year: number, count: number): string => {
  return `BILL-${year}-${String(count + 1).padStart(6, "0")}`;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateTempPassword = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const calculateBMI = (weight: number, height: number): number => {
  return Number((weight / (height * height)).toFixed(2));
};

export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

export const sanitizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.substring(1);
  }

  if (!cleaned.startsWith("234")) {
    cleaned = "234" + cleaned;
  }

  return "+" + cleaned;
};

export const checkVitalFlags = (vitals: any): string[] => {
  const flags: string[] = [];

  // Blood Pressure
  if (vitals.bloodPressure) {
    const [systolic, diastolic] = vitals.bloodPressure.split("/").map(Number);
    if (systolic >= 180 || diastolic >= 120) {
      flags.push("CRITICAL_BP_HIGH");
    } else if (systolic >= 140 || diastolic >= 90) {
      flags.push("WARNING_BP_HIGH");
    } else if (systolic < 90 || diastolic < 60) {
      flags.push("WARNING_BP_LOW");
    }
  }

  // Temperature
  if (vitals.temperature) {
    if (vitals.temperature >= 39.5) {
      flags.push("CRITICAL_TEMP_HIGH");
    } else if (vitals.temperature >= 38) {
      flags.push("WARNING_TEMP_HIGH");
    } else if (vitals.temperature < 35) {
      flags.push("CRITICAL_TEMP_LOW");
    }
  }

  // SpO2
  if (vitals.spo2) {
    if (vitals.spo2 < 90) {
      flags.push("CRITICAL_SPO2_LOW");
    } else if (vitals.spo2 < 95) {
      flags.push("WARNING_SPO2_LOW");
    }
  }

  // Pulse
  if (vitals.pulse) {
    if (vitals.pulse > 120 || vitals.pulse < 50) {
      flags.push("WARNING_PULSE_ABNORMAL");
    }
  }

  // Blood Glucose
  if (vitals.bloodGlucose) {
    if (vitals.bloodGlucose > 200) {
      flags.push("WARNING_GLUCOSE_HIGH");
    } else if (vitals.bloodGlucose < 70) {
      flags.push("WARNING_GLUCOSE_LOW");
    }
  }

  return flags;
};
