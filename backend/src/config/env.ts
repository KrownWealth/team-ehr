import dotenv from "dotenv";

dotenv.config();

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
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
    },
  },

  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!,
    from: process.env.FROM_EMAIL!,
  },

  gcp: {
    projectId: process.env.GCP_PROJECT_ID!,
    bucketName: process.env.GCP_BUCKET_NAME!,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },

  externalApis: {
    ninApiUrl: process.env.NIN_API_URL,
    ninApiKey: process.env.NIN_API_KEY,
    aiDiagnosisUrl: process.env.AI_DIAGNOSIS_FUNCTION_URL,
  },

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || "",
  },
};
