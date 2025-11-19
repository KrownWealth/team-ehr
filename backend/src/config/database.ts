import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger.utils";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: any) => {
    logger.debug("Query: " + e.query);
    logger.debug("Duration: " + e.duration + "ms");
  });
}

prisma.$on("error" as never, (e: any) => {
  logger.error("Prisma Error:", e);
});

export default prisma;
