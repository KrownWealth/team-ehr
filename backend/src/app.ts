import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { config } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { rateLimiter } from "./middleware/rate-limit.midleware";
import v1Routes from "./v1/routes/index";
import logger from "./utils/logger.utils";

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Logging
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "WeCareEHR API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Mount versioned API routes
app.use(`/api/${config.apiVersion}`, v1Routes);

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.path,
  });
});

// Error handler (last)
app.use(errorHandler);

export default app;
