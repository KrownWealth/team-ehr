import { Bucket, Storage } from "@google-cloud/storage";
import { Firestore } from "@google-cloud/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { BigQuery } from "@google-cloud/bigquery";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { config } from "./env";
import logger from "../utils/logger.utils";
import fs from "fs";

// Check if service account file exists
const hasServiceAccount =
  config.gcp.credentials && fs.existsSync(config.gcp.credentials);

if (!hasServiceAccount) {
  logger.warn(
    "⚠️  GCP Service Account not found. GCP services will be disabled for local development."
  );
  logger.warn(
    "   This is normal for local development. GCP services will work in production."
  );
}

// Initialize GCP services only if credentials exist
let storage: Storage | null = null;
let patientPhotosBucket: Bucket | null = null;
let labResultsBucket: Bucket | null = null;
let reportsBucket: Bucket | null = null;
let firestore: Firestore | null = null;
let pubsub: PubSub | null = null;
let bigquery: BigQuery | null = null;
let secretManager: SecretManagerServiceClient | null = null;

if (hasServiceAccount) {
  try {
    // Cloud Storage
    storage = new Storage({
      projectId: config.gcp.projectId,
      keyFilename: config.gcp.credentials,
    });

    patientPhotosBucket = storage.bucket(
      `${config.gcp.projectId}-patient-photos`
    );
    labResultsBucket = storage.bucket(`${config.gcp.projectId}-lab-results`);
    reportsBucket = storage.bucket(`${config.gcp.projectId}-reports`);

    // Firestore
    firestore = new Firestore({
      projectId: config.gcp.projectId,
      keyFilename: config.gcp.credentials,
    });

    // Pub/Sub
    pubsub = new PubSub({
      projectId: config.gcp.projectId,
      keyFilename: config.gcp.credentials,
    });

    // BigQuery
    bigquery = new BigQuery({
      projectId: config.gcp.projectId,
      keyFilename: config.gcp.credentials,
    });

    // Secret Manager
    secretManager = new SecretManagerServiceClient({
      keyFilename: config.gcp.credentials,
    });

    logger.info("✅ GCP services initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize GCP services:", error);
  }
}

// Create mock implementations for local development
const createMockBucket = (): any => ({
  file: () => ({
    save: async () => {
      logger.warn("Mock: File upload skipped (GCP not configured)");
      return Promise.resolve();
    },
    makePublic: async () => Promise.resolve(),
    delete: async () => Promise.resolve(),
  }),
  name: "mock-bucket",
});

const createMockFirestore = (): any => ({
  collection: () => ({
    add: async (data: any) => ({ id: `mock-${Date.now()}` }),
    doc: (id: string) => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => Promise.resolve(),
      update: async () => Promise.resolve(),
      delete: async () => Promise.resolve(),
    }),
    where: () => ({
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            offset: () => ({
              get: async () => ({ docs: [], size: 0 }),
            }),
            get: async () => ({ docs: [], size: 0 }),
          }),
          get: async () => ({ docs: [], size: 0 }),
        }),
        get: async () => ({ docs: [], size: 0 }),
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({ docs: [], size: 0 }),
        }),
        get: async () => ({ docs: [], size: 0 }),
      }),
      get: async () => ({ docs: [], size: 0 }),
    }),
    orderBy: () => ({
      limit: () => ({
        offset: () => ({
          get: async () => ({ docs: [], size: 0 }),
        }),
      }),
    }),
    get: async () => ({ docs: [], size: 0 }),
  }),
  batch: () => ({
    delete: () => {},
    update: () => {},
    commit: async () => Promise.resolve(),
  }),
});

const createMockPubSub = (): any => ({
  topic: () => ({
    publish: async () => {
      logger.warn("Mock: PubSub message skipped (GCP not configured)");
      return Promise.resolve();
    },
  }),
});

const createMockBigQuery = (): any => ({
  dataset: () => ({
    table: () => ({
      insert: async () => {
        logger.warn("Mock: BigQuery insert skipped (GCP not configured)");
        return Promise.resolve();
      },
    }),
  }),
  query: async () => {
    logger.warn("Mock: BigQuery query skipped (GCP not configured)");
    return [[]];
  },
});

// Export with fallbacks for local development
export {
  storage,
  patientPhotosBucket,
  labResultsBucket,
  reportsBucket,
  firestore,
  pubsub,
  bigquery,
  secretManager,
};

// Export safe versions that use mocks when GCP is not available
export const safeStorage = storage || createMockBucket();
export const safePatientPhotosBucket =
  patientPhotosBucket || createMockBucket();
export const safeLabResultsBucket = labResultsBucket || createMockBucket();
export const safeReportsBucket = reportsBucket || createMockBucket();
export const safeFirestore = firestore || createMockFirestore();
export const safePubsub = pubsub || createMockPubSub();
export const safeBigquery = bigquery || createMockBigQuery();
