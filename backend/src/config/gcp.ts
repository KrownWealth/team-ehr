import { Bucket, Storage } from "@google-cloud/storage";
import { Firestore } from "@google-cloud/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { BigQuery } from "@google-cloud/bigquery";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { config } from "./env";

// Cloud Storage
export const storage = new Storage({
  projectId: config.gcp.projectId,
  keyFilename: config.gcp.credentials,
});

export const patientPhotosBucket: Bucket = storage.bucket(
  `${config.gcp.projectId}-patient-photos`
);

export const labResultsBucket: Bucket = storage.bucket(
  `${config.gcp.projectId}-lab-results`
);

export const reportsBucket: Bucket = storage.bucket(
  `${config.gcp.projectId}-reports`
);

// Firestore
export const firestore = new Firestore({
  projectId: config.gcp.projectId,
  keyFilename: config.gcp.credentials,
});

// Pub/Sub
export const pubsub = new PubSub({
  projectId: config.gcp.projectId,
  keyFilename: config.gcp.credentials,
});

// BigQuery
export const bigquery = new BigQuery({
  projectId: config.gcp.projectId,
  keyFilename: config.gcp.credentials,
});

// Secret Manager
export const secretManager = new SecretManagerServiceClient({
  keyFilename: config.gcp.credentials,
});
