import { Request, Response, NextFunction } from "express";
import { firestore } from "../config/gcp";
import logger from "../utils/logger.utils";

export interface IdempotentRequest extends Request {
  requestId?: string;
  isRetry?: boolean;
}

const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const idempotencyCheck = (options?: { required?: boolean }) => {
  return async (req: IdempotentRequest, res: Response, next: NextFunction) => {
    try {
      const requestId =
        req.headers["x-request-id"] || req.headers["x-idempotency-key"];

      if (!requestId) {
        // If idempotency is required but no ID provided, reject
        if (options?.required) {
          return res.status(400).json({
            status: "error",
            message: "X-Request-ID header is required for this operation",
          });
        }
        return next();
      }

      req.requestId = requestId as string;

      if (!firestore) {
        throw new Error("Firestore is not initialized");
      }
      const idempotencyDoc = firestore
        .collection("idempotency_keys")
        .doc(requestId as string);

      const existingRequest = await idempotencyDoc.get();

      if (existingRequest.exists) {
        const data = existingRequest.data();

        // Check if the request has expired
        if (data && data.expiresAt.toMillis() < Date.now()) {
          // Expired - delete and process as new
          await idempotencyDoc.delete();
          logger.info(`Expired idempotency key deleted: ${requestId}`);
        } else {
          // Request already processed - return cached response
          logger.info(`Duplicate request detected: ${requestId}`);
          req.isRetry = true;

          return res.status(data!.statusCode).json(data!.response);
        }
      }

      // Store original res.json to intercept response
      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        // Cache the response in Firestore for idempotency
        const statusCode = res.statusCode;

        idempotencyDoc
          .set({
            requestId,
            method: req.method,
            path: req.path,
            statusCode,
            response: body,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL),
          })
          .then(() => {
            logger.info(`Idempotency key stored: ${requestId}`);
          })
          .catch((error) => {
            logger.error("Failed to store idempotency key:", error);
            // Don't fail the request if caching fails
          });

        return originalJson(body);
      };

      next();
    } catch (error: any) {
      logger.error("Idempotency check error:", error);
      // Don't fail the request if idempotency check fails
      next();
    }
  };
};

export const cleanupExpiredKeys = async (): Promise<number> => {
  try {
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    const snapshot = await firestore
      .collection("idempotency_keys")
      .where("expiresAt", "<", new Date())
      .limit(500)
      .get();

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    logger.info(`Cleaned up ${snapshot.size} expired idempotency keys`);
    return snapshot.size;
  } catch (error) {
    logger.error("Failed to cleanup idempotency keys:", error);
    throw error;
  }
};
