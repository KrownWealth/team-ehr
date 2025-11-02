import { Bucket, Storage } from "@google-cloud/storage";
import { Firestore } from "@google-cloud/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { BigQuery } from "@google-cloud/bigquery";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { config } from "./env";
import logger from "../utils/logger.utils";
import fs from "fs";

// Check if running in Cloud Run (has automatic credentials)
const isCloudRun = process.env.K_SERVICE !== undefined;

// Check if service account file exists (local development)
const hasServiceAccount =
  config.gcp.credentials && fs.existsSync(config.gcp.credentials);

if (!hasServiceAccount && !isCloudRun) {
  logger.warn(
    "⚠️  GCP Service Account not found. GCP services will be disabled for local development."
  );
  logger.warn(
    "   This is normal for local development. GCP services will work in production."
  );
}

// Initialize GCP services
let storage: Storage | null = null;
let patientPhotosBucket: Bucket | null = null;
let labResultsBucket: Bucket | null = null;
let reportsBucket: Bucket | null = null;
let firestore: Firestore | null = null;
let pubsub: PubSub | null = null;
let bigquery: BigQuery | null = null;
let secretManager: SecretManagerServiceClient | null = null;

if (hasServiceAccount || isCloudRun) {
  try {
    // Cloud Storage
    storage = new Storage(
      hasServiceAccount
        ? {
            keyFilename: config.gcp.credentials,
          }
        : undefined // Use default credentials in Cloud Run
    );

    patientPhotosBucket = storage.bucket(
      `${config.gcp.projectId}-patient-photos`
    );
    labResultsBucket = storage.bucket(`${config.gcp.projectId}-lab-results`);
    reportsBucket = storage.bucket(`${config.gcp.projectId}-reports`);

    // Firestore
    firestore = new Firestore(
      hasServiceAccount
        ? {
            keyFilename: config.gcp.credentials,
          }
        : undefined
    );

    // Pub/Sub
    pubsub = new PubSub(
      hasServiceAccount
        ? {
            keyFilename: config.gcp.credentials,
          }
        : undefined
    );

    // BigQuery
    bigquery = new BigQuery(
      hasServiceAccount
        ? {
            keyFilename: config.gcp.credentials,
          }
        : undefined
    );

    // Secret Manager
    secretManager = new SecretManagerServiceClient(
      hasServiceAccount
        ? {
            keyFilename: config.gcp.credentials,
          }
        : undefined
    );

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
    onSnapshot: () => () => {}, // Mock unsubscribe function
  }),
  batch: () => ({
    delete: () => {},
    update: () => {},
    commit: async () => Promise.resolve(),
  }),
});

const createMockPubSub = (): any => ({
  topic: () => ({
    publishMessage: async () => {
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

// Export with fallbacks
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

export const safeStorage = storage || createMockBucket();
export const safePatientPhotosBucket =
  patientPhotosBucket || createMockBucket();
export const safeLabResultsBucket = labResultsBucket || createMockBucket();
export const safeReportsBucket = reportsBucket || createMockBucket();
export const safeFirestore = firestore || createMockFirestore();
export const safePubsub = pubsub || createMockPubSub();
export const safeBigquery = bigquery || createMockBigQuery();
