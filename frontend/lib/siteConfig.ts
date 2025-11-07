export const siteConfig = {
  name: "wecareEHR",
  description: "Modern Healthcare Management System",
  tagline: "Efficient. Secure. Patient-Centered.",
  url: "https://app.wecareehr.com",

  links: {
    support: 'mailto:support@wecarehr.com'
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    timeout: 30000,
  },

  roles: {
    ADMIN: "ADMIN",
    CLERK: "CLERK",
    NURSE: "NURSE",
    DOCTOR: "DOCTOR",
    LAB_TECH: "LAB_TECH",
    CASHIER: "CASHIER",
    PATIENT: "PATIENT",
  } as const,

  roleLabels: {
    ADMIN: "Administrator",
    CLERK: "Front Desk Clerk",
    NURSE: "Nurse",
    DOCTOR: "Doctor",
    LAB_TECH: "Lab Technician",
    CASHIER: "Cashier",
    PATIENT: "Patient",
  },

  features: {
    enablePatientPortal: true,
    enableSMSNotifications: false, // Coming soon
    enableLabIntegration: true,
    enableBilling: true,
    enableAISuggestions: false, // Mock only
  },

  vitalsThresholds: {
    bloodPressure: {
      systolic: {
        normal: [90, 120],
        warning: [121, 139],
        critical: [140, 999],
      },
      diastolic: { normal: [60, 80], warning: [81, 89], critical: [90, 999] },
    },
    temperature: {
      normal: [36.1, 37.2],
      warning: [37.3, 38.0],
      critical: [38.1, 999],
    },
    pulse: {
      normal: [60, 100],
      warning: [50, 59, 101, 110],
      critical: [0, 49, 111, 999],
    },
    respirationRate: {
      normal: [12, 20],
      warning: [10, 11, 21, 25],
      critical: [0, 9, 26, 999],
    },
    oxygenSaturation: {
      normal: [95, 100],
      warning: [90, 94],
      critical: [0, 89],
    },
    bloodGlucose: {
      normal: [70, 140],
      warning: [60, 69, 141, 180],
      critical: [0, 59, 181, 999],
    },
  },

  pagination: {
    defaultLimit: 10,
    limitOptions: [10, 20, 50, 100],
  },

  dateFormats: {
    display: "MMM dd, yyyy",
    displayWithTime: "MMM dd, yyyy hh:mm a",
    api: "yyyy-MM-dd",
  },


} as const;

export type Role = keyof typeof siteConfig.roles;
export type RoleValue = (typeof siteConfig.roles)[Role];
