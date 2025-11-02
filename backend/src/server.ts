import { validateOrExit } from "./config/env";
import prisma from "./config/database";
import logger from "./utils/logger.utils";
import app from "./app";

validateOrExit();

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

  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`\n${signal} signal received: closing HTTP server`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Database connection closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer();
