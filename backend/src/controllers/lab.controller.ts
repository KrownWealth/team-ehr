import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { StorageService } from "../services/storage.service";
import { PubSubService } from "../services/pubsub.service";
import { EmailService } from "../services/email.service";
import logger from "../utils/logger.utils";

const storageService = new StorageService();
const pubsubService = new PubSubService();
const emailService = new EmailService();

// Extended PubSubService methods
declare module "../services/pubsub.service" {
  interface PubSubService {
    publishLabOrderCreated(data: any): Promise<void>;
  }
}

// Extended EmailService methods
declare module "../services/email.service" {
  interface EmailService {
    sendLabResultNotification(
      to: string,
      firstName: string,
      labOrderId: string
    ): Promise<void>;
  }
}

/**
 * Create a new lab order
 */
export const createLabOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, consultationId, tests, notes, urgency } = req.body;
    const { clinicId } = req;

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found in this clinic",
      });
    }

    // Verify consultation if provided
    if (consultationId) {
      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, clinicId },
      });

      if (!consultation) {
        return res.status(404).json({
          status: "error",
          message: "Consultation not found",
        });
      }
    }

    // Create lab order in Firestore
    const { firestore } = await import("../config/gcp");
    const labOrderRef = await firestore.collection("lab_orders").add({
      clinicId,
      patientId,
      consultationId: consultationId || null,
      tests,
      notes,
      urgency: urgency || "ROUTINE",
      status: "PENDING",
      orderedBy: req.user!.id,
      orderedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const labOrder = {
      id: labOrderRef.id,
      clinicId,
      patientId,
      consultationId,
      tests,
      notes,
      urgency: urgency || "ROUTINE",
      status: "PENDING",
    };

    // Publish event
    await pubsubService.publishLabOrderCreated({
      labOrderId: labOrderRef.id,
      patientId,
      clinicId,
      urgency: urgency || "ROUTINE",
    });

    logger.info(`Lab order created: ${labOrderRef.id}`);

    res.status(201).json({
      status: "success",
      data: labOrder,
    });
  } catch (error: any) {
    logger.error("Create lab order error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get all lab orders
 */
export const getAllLabOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { status, patientId, urgency, page = 1, limit = 50 } = req.query;

    const { firestore } = await import("../config/gcp");
    let query = firestore
      .collection("lab_orders")
      .where("clinicId", "==", clinicId);

    if (status) query = query.where("status", "==", status);
    if (patientId) query = query.where("patientId", "==", patientId);
    if (urgency) query = query.where("urgency", "==", urgency);

    const snapshot = await query
      .orderBy("orderedAt", "desc")
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit))
      .get();

    const labOrders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Enrich with patient data
    const patientIds = [...new Set(labOrders.map((o: any) => o.patientId))];
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    const patientMap = new Map(patients.map((p: any) => [p.id, p]));
    const enrichedOrders = labOrders.map((o: any) => ({
      ...o,
      patient: patientMap.get(o.patientId),
    }));

    res.json({
      status: "success",
      data: {
        labOrders: enrichedOrders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: snapshot.size,
        },
      },
    });
  } catch (error: any) {
    logger.error("Get all lab orders error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Get lab order by ID
 */
export const getLabOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    const { firestore } = await import("../config/gcp");
    const doc = await firestore.collection("lab_orders").doc(id).get();

    if (!doc.exists || (doc.data() as any).clinicId !== clinicId) {
      return res
        .status(404)
        .json({ status: "error", message: "Lab order not found" });
    }

    const labOrder: any = { id: doc.id, ...doc.data() };
    const patient = await prisma.patient.findUnique({
      where: { id: labOrder.patientId },
      select: {
        patientNumber: true,
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
      },
    });

    res.json({ status: "success", data: { ...labOrder, patient } });
  } catch (error: any) {
    logger.error("Get lab order error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Update lab order status
 */
export const updateLabOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const { clinicId } = req;

    const { firestore } = await import("../config/gcp");
    const docRef = firestore.collection("lab_orders").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || (doc.data() as any).clinicId !== clinicId) {
      return res
        .status(404)
        .json({ status: "error", message: "Lab order not found" });
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
      updatedBy: req.user!.id,
    };
    if (notes) updateData.notes = notes;
    if (status === "IN_PROGRESS") updateData.startedAt = new Date();
    if (status === "COMPLETED") updateData.completedAt = new Date();

    await docRef.update(updateData);
    logger.info(`Lab order ${id} updated to ${status}`);

    res.json({ status: "success", data: { id, ...doc.data(), ...updateData } });
  } catch (error: any) {
    logger.error("Update lab order error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Upload lab result
 */
export const uploadLabResult = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicId } = req;

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "error", message: "No file uploaded" });
    }

    const { firestore } = await import("../config/gcp");
    const docRef = firestore.collection("lab_orders").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || (doc.data() as any).clinicId !== clinicId) {
      return res
        .status(404)
        .json({ status: "error", message: "Lab order not found" });
    }

    const fileUrl = await storageService.uploadLabResult(req.file, id);
    await docRef.update({
      resultFileUrl: fileUrl,
      resultUploadedAt: new Date(),
      resultUploadedBy: req.user!.id,
      status: "COMPLETED",
      completedAt: new Date(),
      updatedAt: new Date(),
    });

    const labOrder: any = doc.data();
    const patient = await prisma.patient.findUnique({
      where: { id: labOrder.patientId },
      select: { email: true, firstName: true },
    });

    if (patient?.email) {
      await emailService.sendLabResultNotification(
        patient.email,
        patient.firstName,
        id
      );
    }

    await pubsubService.publishLabResultReady({
      labOrderId: id,
      patientId: labOrder.patientId,
      clinicId,
    });
    logger.info(`Lab result uploaded: ${id}`);

    res.json({
      status: "success",
      data: { labOrderId: id, resultFileUrl: fileUrl },
    });
  } catch (error: any) {
    logger.error("Upload lab result error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Get patient lab history
 */
export const getPatientLabHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { clinicId } = req;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
    });
    if (!patient) {
      return res
        .status(404)
        .json({ status: "error", message: "Patient not found" });
    }

    const { firestore } = await import("../config/gcp");
    const snapshot = await firestore
      .collection("lab_orders")
      .where("patientId", "==", patientId)
      .orderBy("orderedAt", "desc")
      .get();
    const labOrders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ status: "success", data: labOrders });
  } catch (error: any) {
    logger.error("Get patient lab history error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Get lab test catalog
 */
export const getLabTestCatalog = async (req: AuthRequest, res: Response) => {
  const catalog = [
    {
      category: "Hematology",
      tests: [
        { code: "CBC", name: "Complete Blood Count", price: 5000 },
        { code: "ESR", name: "ESR", price: 2000 },
      ],
    },
    {
      category: "Biochemistry",
      tests: [
        { code: "FBS", name: "Fasting Blood Sugar", price: 2000 },
        { code: "LFT", name: "Liver Function Test", price: 8000 },
      ],
    },
    {
      category: "Microbiology",
      tests: [
        { code: "URINE_CS", name: "Urine C&S", price: 6000 },
        { code: "BLOOD_CS", name: "Blood C&S", price: 8000 },
      ],
    },
    {
      category: "Serology",
      tests: [
        { code: "HIV", name: "HIV Screening", price: 3000 },
        { code: "HEP_B", name: "Hep B Surface Ag", price: 4000 },
      ],
    },
  ];
  res.json({ status: "success", data: catalog });
};
