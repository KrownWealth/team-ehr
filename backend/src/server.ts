import app from "./app";
import { config } from "./config/env";
import prisma from "./config/database";
import logger from "./utils/logger.utils";

const PORT = config.port || 8080;

// Test database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info("🚀 ===================================");
    logger.info(`🚀 WeCareEHR Backend Server Started`);
    logger.info(`🚀 Environment: ${config.nodeEnv}`);
    logger.info(`🚀 Port: ${PORT}`);
    logger.info(`🚀 API Version: ${config.apiVersion}`);
    logger.info(
      `🚀 API URL: http://localhost:${PORT}/api/${config.apiVersion}`
    );
    logger.info("🚀 ===================================");
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`\n${signal} signal received: closing HTTP server`);

    server.close(async () => {
      logger.info("HTTP server closed");

      await prisma.$disconnect();
      logger.info("Database connection closed");

      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    process.exit(1);
  });
}

startServer();
