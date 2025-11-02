import { Router } from "express";
import type { Router as RouterType } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import logger from "../../utils/logger.utils";
import { firestore } from "../../config/gcp";
import { AuthRequest } from "../../middleware/auth.middleware";

const notificationRoutes: RouterType = Router();

notificationRoutes.use(authenticate);

/**
 * POST /api/v1/notifications/send
 * Send notification (for internal system use)
 */
notificationRoutes.post("/send", async (req: AuthRequest, res) => {
  try {
    const { userId, title, message, type, data } = req.body;

    const notification = {
      userId,
      title,
      message,
      type: type || "INFO",
      data: data || {},
      read: false,
      createdAt: new Date(),
    };

    const docRef = await firestore
      .collection("notifications")
      .add(notification);

    logger.info(`Notification sent to user: ${userId}`);

    res.status(201).json({
      status: "success",
      data: { id: docRef.id, ...notification },
      message: "Notification sent successfully",
    });
  } catch (error: any) {
    logger.error("Send notification error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/notifications
 * Get user notifications
 */
notificationRoutes.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 20, unreadOnly = false } = req.query;

    let query = firestore
      .collection("notifications")
      .where("userId", "==", userId);

    if (unreadOnly === "true") {
      query = query.where("read", "==", false);
    }

    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(Number(limit))
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      status: "success",
      data: {
        notifications,
        total: notifications.length,
      },
    });
  } catch (error: any) {
    logger.error("Get notifications error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/notifications/:id
 * Get notification by ID
 */
notificationRoutes.get("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const doc = await firestore.collection("notifications").doc(id).get();

    if (!doc.exists || (doc.data() as any).userId !== userId) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    res.json({
      status: "success",
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    logger.error("Get notification error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark notification as read
 */
notificationRoutes.patch("/:id/read", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const docRef = firestore.collection("notifications").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || (doc.data() as any).userId !== userId) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    await docRef.update({ read: true, readAt: new Date() });

    res.json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error: any) {
    logger.error("Mark notification read error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * PATCH /api/v1/notifications/mark-all-read
 * Mark all notifications as read
 */
notificationRoutes.patch("/mark-all-read", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const snapshot = await firestore
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true, readAt: new Date() });
    });

    await batch.commit();

    res.json({
      status: "success",
      message: `${snapshot.size} notifications marked as read`,
    });
  } catch (error: any) {
    logger.error("Mark all read error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default notificationRoutes;
