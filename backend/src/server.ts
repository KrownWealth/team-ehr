import { validateEnvironment } from "./config/env";
import prisma from "./config/database";
import app from "./app";
import logger from "./utils/logger.utils";

const result = validateEnvironment();
if (result.warnings.length > 0) {
  console.warn("Environment validation warnings:");
  result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
}
if (!result.isValid) {
  console.error("❌ Environment validation failed:");
  result.errors.forEach((error) => console.error(`  - ${error}`));
  console.error("\nPlease check your .env file and try again.");
  process.exit(1);
}
console.info("✅ Environment validation passed");

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
