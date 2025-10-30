import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { SyncService, SyncAction } from "../services/sync.service";
import logger from "../utils/logger.utils";

const syncService = new SyncService();

/**
 * Main synchronization endpoint
 * Processes offline actions and returns server updates
 */
export const syncData = async (req: AuthRequest, res: Response) => {
  try {
    const { lastSyncTimestamp, pendingActions } = req.body;
    const { clinicId, user } = req;

    if (!Array.isArray(pendingActions)) {
      return res.status(400).json({
        status: "error",
        message: "pendingActions must be an array",
      });
    }

    logger.info(
      `Sync started for clinic ${clinicId}: ${pendingActions.length} pending actions`
    );

    const result = await syncService.processSync(
      clinicId!,
      user!.id,
      lastSyncTimestamp || null,
      pendingActions as SyncAction[]
    );

    // Count successes and failures
    const successful = result.processedActions.filter((a) => a.success).length;
    const failed = result.processedActions.filter((a) => !a.success).length;
    const conflicts = result.processedActions.filter((a) => a.conflict).length;

    logger.info(
      `Sync completed: ${successful} successful, ${failed} failed, ${conflicts} conflicts`
    );

    res.json({
      status: "success",
      data: result,
      summary: {
        totalActions: pendingActions.length,
        successful,
        failed,
        conflicts,
      },
    });
  } catch (error: any) {
    logger.error("Sync error:", error);
    res.status(500).json({
      status: "error",
      message: "Synchronization failed",
      error: error.message,
    });
  }
};

/**
 * Get sync status for debugging
 */
export const getSyncStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { lastSyncTimestamp } = req.query;

    if (!lastSyncTimestamp) {
      return res.status(400).json({
        status: "error",
        message: "lastSyncTimestamp query parameter is required",
      });
    }

    const result = await syncService.processSync(
      clinicId!,
      req.user!.id,
      lastSyncTimestamp as string,
      [] // No pending actions, just check for updates
    );

    const totalUpdates =
      result.serverUpdates.patients.length +
      result.serverUpdates.vitals.length +
      result.serverUpdates.consultations.length +
      result.serverUpdates.bills.length +
      result.serverUpdates.appointments.length;

    res.json({
      status: "success",
      data: {
        hasUpdates: totalUpdates > 0,
        updateCounts: {
          patients: result.serverUpdates.patients.length,
          vitals: result.serverUpdates.vitals.length,
          consultations: result.serverUpdates.consultations.length,
          bills: result.serverUpdates.bills.length,
          appointments: result.serverUpdates.appointments.length,
        },
        lastSyncTimestamp: result.lastSyncTimestamp,
      },
    });
  } catch (error: any) {
    logger.error("Get sync status error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Force full sync (redownload all data)
 */
export const fullSync = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    logger.info(`Full sync requested for clinic: ${clinicId}`);

    // Fetch all data for clinic (no timestamp filter)
    const result = await syncService.processSync(
      clinicId!,
      req.user!.id,
      null, // No last sync timestamp = get everything
      [] // No pending actions
    );

    res.json({
      status: "success",
      data: result,
      message: "Full sync completed",
    });
  } catch (error: any) {
    logger.error("Full sync error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
