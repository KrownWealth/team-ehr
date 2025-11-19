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

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://team-ehr.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL_2,
      ].filter(Boolean);

      if (allowedOrigins.some((allowed) => origin.startsWith(allowed || ""))) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-ID",
      "X-Idempotency-Key",
    ],
    exposedHeaders: ["X-Request-ID"],
    maxAge: 86400,
  })
);

app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(compression());

app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

app.use(rateLimiter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "WeCareEHR API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use(`/api/${config.apiVersion}`, v1Routes);

app.use((req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.path,
  });
});

app.use(errorHandler);

export default app;
