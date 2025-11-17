import { validateEnvironment } from "./config/env";
import prisma from "./config/database";
import app from "./app";
import logger from "./utils/logger.utils";

// Validate environment
const result = validateEnvironment();
if (result.warnings.length > 0) {
  console.warn("Environment validation warnings:");
  result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
}

if (!result.isValid) {
  console.error("❌ Environment validation failed:");
  result.errors.forEach((error) => console.error(`  - ${error}`));
  console.error("\nPlease check your environment configuration.");
  process.exit(1);
}
console.info("✅ Environment validation passed");

async function startServer() {
  // Cloud Run provides PORT via environment variable
  const PORT = process.env.PORT || 8080;

  // Start server FIRST - this is critical for Cloud Run health checks
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`API Version: ${process.env.API_VERSION || "v1"}`);

    // Connect to database AFTER server starts (non-blocking)
    connectDatabase().catch((err) => {
      logger.error("Database connection error:", err);
      // Don't exit - let health checks pass
    });
  });

  server.on("error", (error: any) => {
    logger.error("Server error:", error);
    if (error.code === "EADDRINUSE") {
      logger.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Graceful shutdown handlers
  const gracefulShutdown = async (signal: string) => {
    logger.info(`\n${signal} signal received: closing HTTP server`);

    server.close(async () => {
      logger.info("HTTP server closed");

      try {
        await prisma.$disconnect();
        logger.info("Database connection closed");
      } catch (error) {
        logger.error("Error disconnecting from database:", error);
      }

      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    // In production, continue without DB - health checks will still pass
    logger.warn("⚠️  Continuing without database connection");
  }
}

// Start the server
startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
