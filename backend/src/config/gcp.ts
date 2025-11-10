import { Storage } from "@google-cloud/storage";
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { PubSub, Topic, Subscription } from "@google-cloud/pubsub";
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
let firestore: Firestore | null = null;
let secretManager: SecretManagerServiceClient | null = null;
let vertexai: VertexAI | null = null;
let pubsub: PubSub | null = null;

if (hasServiceAccount) {
  try {
    // Cloud Storage
    storage = new Storage({
      //  projectId: config.gcp.projectId,
      keyFilename: config.gcp.credentials,
    });

    // Firestore
    firestore = new Firestore({
      // projectId: config.gcp.projectId,
      keyFilename: config.gcp.credentials,
    });

    secretManager = new SecretManagerServiceClient({
      keyFilename: config.gcp.credentials,
    });

    pubsub = new PubSub({
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

const mockVertexAi = (): any => ({
  // Add mock methods as needed
});

class MockPubSub {
  topic(name: string) {
    logger.warn(`Mock: topic "${name}" called (Pub/Sub not configured)`);
    return {
      publishMessage: async (msg: { data: Buffer }) => {
        logger.warn(
          `Mock: publishMessage called with data: ${msg.data.toString()}`
        );
        return "mock-message-id";
      },
      subscription: (subscriptionName: string) => new MockSubscription(),
    } as unknown as Topic;
  }
}

class MockSubscription {
  on(event: "message" | "error", handler: (arg: any) => void) {
    logger.warn(`Mock: subscription.on("${event}") called`);
    return this;
  }
}

export { storage, firestore, vertexai, secretManager };

// Export safe versions that use mocks when GCP is not available
export const safeStorage = storage || createMockBucket();
export const safeFirestore = firestore || createMockFirestore();
export const safeVertexAi = vertexai || mockVertexAi();
export const safeSecretManager = secretManager || {};
export const safePubSub: PubSub =
  pubsub || (new MockPubSub() as unknown as PubSub);
