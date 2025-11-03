import { validateEnvironment } from "./config/env";
import { firestore, isUsingEmulator } from "./config/gcp";
import app from "./app";
import logger from "./utils/logger.utils";

// Validate environment variables
const result = validateEnvironment();
if (result.warnings.length > 0) {
  console.warn("⚠️ Environment validation warnings:");
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
  const PORT = parseInt(process.env.PORT || "8080", 10);

  // Start server FIRST - critical for Cloud Run health checks
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📦 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔢 API Version: ${process.env.API_VERSION || "v1"}`);

    if (isUsingEmulator()) {
      logger.info(`🔧 Using Firestore Emulator`);
      logger.info(`📊 Emulator UI: http://localhost:4000`);
    } else {
      logger.info(`☁️ Connected to production Firestore`);
    }

    // Test Firestore connection
    testFirestoreConnection().catch((err) => {
      logger.error("Firestore connection test failed:", err);
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
        // Firestore doesn't need explicit disconnection
        // but we can clean up any pending operations
        await firestore.terminate();
        logger.info("Firestore connection terminated");
      } catch (error) {
        logger.error("Error terminating Firestore:", error);
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

/**
 * Test Firestore connection by attempting a simple operation
 */
async function testFirestoreConnection() {
  try {
    // Try to list collections (doesn't create any data)
    const collections = await firestore.listCollections();
    logger.info(
      `✅ Firestore connected successfully (${collections.length} collections)`
    );
  } catch (error) {
    logger.error("❌ Firestore connection failed:", error);
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        "⚠️ Continuing without database - health checks will still pass"
      );
    }
  }
}

// Start the server
startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
