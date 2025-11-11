import dotenv from "dotenv";
dotenv.config();

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required for all environments
  const required = [
    "NODE_ENV",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Production-specific requirements
  if (process.env.NODE_ENV === "production") {
    const productionRequired = [
      "SMTP_HOST",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "ENCRYPTION_KEY",
    ];

    productionRequired.forEach((key) => {
      if (!process.env[key]) {
        errors.push(`Missing production environment variable: ${key}`);
      }
    });

    // Check for weak secrets in production
    if (
      process.env.JWT_SECRET &&
      process.env.JWT_SECRET.includes("local-dev")
    ) {
      errors.push("JWT_SECRET appears to be a development secret!");
    }
  }

  const recommended = ["FRONTEND_URL", "GCP_PROJECT_ID"];
  recommended.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`Optional environment variable not set: ${key}`);
    }
  });

  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.startsWith("postgresql://")
  ) {
    errors.push("DATABASE_URL must start with postgresql://");
  }

  if (
    process.env.FRONTEND_URL &&
    !process.env.FRONTEND_URL.startsWith("http")
  ) {
    errors.push("FRONTEND_URL must be a valid HTTP(S) URL");
  }

  // PORT validation - Cloud Run sets this automatically
  const port = parseInt(process.env.PORT || "8080", 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push("PORT must be a valid number between 1 and 65535");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8080", 10),
  apiVersion: process.env.API_VERSION || "v1",
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || "",
    },
  },
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.FROM_EMAIL || "noreply@wecareehr.com",
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID || "team-ehr",
    bucketName: process.env.GCP_BUCKET_NAME || "",
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  externalApis: {
    ninApiUrl: process.env.NIN_API_URL,
    ninApiKey: process.env.NIN_API_KEY,
    aiDiagnosisUrl: process.env.AI_DIAGNOSIS_FUNCTION_URL,
    aiDiagnosisAPIKey: process.env.AI_API_KEY,
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },
};
