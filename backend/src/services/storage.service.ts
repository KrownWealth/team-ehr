import {
  patientPhotosBucket,
  labResultsBucket,
  reportsBucket,
} from "../config/gcp";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.utils";

export class StorageService {
  async uploadPatientPhoto(
    file: Express.Multer.File,
    patientId: string
  ): Promise<string> {
    try {
      const filename = `${patientId}/${uuidv4()}-${file.originalname}`;
      const blob = patientPhotosBucket.file(filename);

      await blob.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      await blob.makePublic();

      const url = `https://storage.googleapis.com/${patientPhotosBucket.name}/${filename}`;
      logger.info(`Patient photo uploaded: ${url}`);
      return url;
    } catch (error) {
      logger.error("Failed to upload patient photo:", error);
      throw error;
    }
  }

  async uploadLabResult(
    file: Express.Multer.File,
    consultationId: string
  ): Promise<string> {
    try {
      const filename = `${consultationId}/${uuidv4()}-${file.originalname}`;
      const blob = labResultsBucket.file(filename);

      await blob.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      const url = `https://storage.googleapis.com/${labResultsBucket.name}/${filename}`;
      logger.info(`Lab result uploaded: ${url}`);
      return url;
    } catch (error) {
      logger.error("Failed to upload lab result:", error);
      throw error;
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const filename = url.split("/").slice(-2).join("/");
      const bucket = url.includes("patient-photos")
        ? patientPhotosBucket
        : labResultsBucket;

      await bucket.file(filename).delete();
      logger.info(`File deleted: ${filename}`);
    } catch (error) {
      logger.error("Failed to delete file:", error);
      throw error;
    }
  }
}
