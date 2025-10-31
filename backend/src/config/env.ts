import logger from "../utils/logger.utils";

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
    "PORT",
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
      "FRONTEND_URL",
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

  // Optional but recommended
  const recommended = ["SMTP_HOST", "FRONTEND_URL", "GCP_PROJECT_ID"];

  recommended.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`Optional environment variable not set: ${key}`);
    }
  });

  // Validate URL formats
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

  // Validate numeric values
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

// Run validation on startup
export function validateOrExit() {
  const result = validateEnvironment();

  if (result.warnings.length > 0) {
    logger.warn("Environment validation warnings:");
    result.warnings.forEach((warning) => logger.warn(`  - ${warning}`));
  }

  if (!result.isValid) {
    logger.error("❌ Environment validation failed:");
    result.errors.forEach((error) => logger.error(`  - ${error}`));
    logger.error("\nPlease check your .env file and try again.");
    process.exit(1);
  }

  logger.info("✅ Environment validation passed");
}
