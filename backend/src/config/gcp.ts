import { Firestore } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";
import { VertexAI } from "@google-cloud/vertexai";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { config } from "./env";
import logger from "../utils/logger.utils";

let firestore: Firestore;
let storage: Storage | null = null;
let vertexai: VertexAI | null = null;
let secretManager: SecretManagerServiceClient | null = null;

const isDevelopment = config.nodeEnv === "development";
const useEmulator = isDevelopment || !!process.env.FIRESTORE_EMULATOR_HOST;

try {
  if (useEmulator) {
    logger.info("🔧 Using Firestore Emulator for local development");

    firestore = new Firestore({
      projectId: config.gcp.projectId,
      host: process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8081",
      ssl: false,
      ignoreUndefinedProperties: true,
    });
  } else {
    // Production: Use service account credentials
    logger.info("☁️ Connecting to production Firestore");

    const firestoreConfig: any = {
      projectId: config.gcp.projectId,
      ignoreUndefinedProperties: true,
    };

    // Use service account if provided
    if (config.gcp.credentials) {
      firestoreConfig.keyFilename = config.gcp.credentials;
      logger.info("✅ Using service account credentials");
    } else {
      logger.info("✅ Using default application credentials");
    }

    firestore = new Firestore(firestoreConfig);
  }

  if (!isDevelopment && config.gcp.credentials) {
    try {
      storage = new Storage({
        projectId: config.gcp.projectId,
        keyFilename: config.gcp.credentials,
      });
      logger.info("✅ Cloud Storage initialized");
    } catch (error) {
      logger.warn("⚠️ Cloud Storage not initialized:", error);
      storage = null;
    }
  } else {
    logger.info("ℹ️ Cloud Storage disabled in development mode");
  }

  if (!isDevelopment && config.gcp.credentials) {
    try {
      vertexai = new VertexAI({
        project: config.gcp.projectId,
        location: "us-central1",
      });
      logger.info("✅ Vertex AI initialized");
    } catch (error) {
      logger.warn("⚠️ Vertex AI not initialized:", error);
      vertexai = null;
    }
  } else {
    logger.info("ℹ️ Vertex AI disabled in development mode");
  }

  if (!isDevelopment && config.gcp.credentials) {
    try {
      secretManager = new SecretManagerServiceClient({
        keyFilename: config.gcp.credentials,
      });
      logger.info("✅ Secret Manager initialized");
    } catch (error) {
      logger.warn("⚠️ Secret Manager not initialized:", error);
      secretManager = null;
    }
  } else {
    logger.info("ℹ️ Secret Manager disabled in development mode");
  }

  logger.info("✅ GCP services initialization complete");
} catch (error) {
  logger.error("❌ Failed to initialize GCP services:", error);
  throw error;
}

export function getBucket(bucketName?: string): any {
  if (!storage) {
    throw new Error("Cloud Storage is not initialized");
  }
  return storage.bucket(bucketName || config.gcp.bucketName);
}

export async function getSecret(secretName: string): Promise<string> {
  if (!secretManager) {
    throw new Error("Secret Manager is not initialized");
  }

  const name = `projects/${config.gcp.projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await secretManager.accessSecretVersion({ name });
  return version.payload?.data?.toString() || "";
}

export function isUsingEmulator(): boolean {
  return useEmulator;
}

export function getFirestoreAdmin() {
  return firestore;
}

export { firestore, storage, vertexai, secretManager };
export default firestore;
