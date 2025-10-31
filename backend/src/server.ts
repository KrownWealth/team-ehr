import app from "./app";
import { validateOrExit } from "./config/env";
import prisma from "./config/database";
import logger from "./utils/logger.utils";

validateOrExit();
const PORT = process.env.PORT || 5000;

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

async function startServer() {
  await connectDatabase();

  // const server = app.listen(PORT, () => {
  //   logger.info("🚀 ===================================");
  //   logger.info(`🚀 WeCareEHR Backend Server Started`);
  //   logger.info(`🚀 Environment: ${config.nodeEnv}`);
  //   logger.info(`🚀 Port: ${PORT}`);
  //   logger.info(`🚀 API Version: ${config.apiVersion}`);
  //   logger.info(
  //     `🚀 API URL: http://localhost:${PORT}/api/${config.apiVersion}`
  //   );
  //   logger.info("🚀 ===================================");
  // });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`\n${signal} signal received: closing HTTP server`);
    await prisma.$disconnect();
    logger.info("Database connection closed");
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer();
