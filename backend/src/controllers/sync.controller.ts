import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { SyncService, SyncAction } from "../services/sync.service";
import logger from "../utils/logger.utils";
import {
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/response.utils";

const syncService = new SyncService();

export const syncData = async (req: AuthRequest, res: Response) => {
  try {
    const { lastSyncTimestamp, pendingActions } = req.body;
    const { clinicId, user } = req;

    if (!Array.isArray(pendingActions)) {
      return badRequestResponse(res, "pendingActions must be an array");
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

    return successResponse(
      res,
      result,
      "Synchronization completed successfully"
      // {
      //   summary: {
      //     totalActions: pendingActions.length,
      //     successful,
      //     failed,
      //     conflicts,
      //   },
      // }
    );
  } catch (error: any) {
    logger.error("Sync error:", error);
    return serverErrorResponse(res, "Synchronization failed", error);
  }
};

export const getSyncStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;
    const { lastSyncTimestamp } = req.query;

    if (!lastSyncTimestamp) {
      return badRequestResponse(
        res,
        "lastSyncTimestamp query parameter is required"
      );
    }

    const result = await syncService.processSync(
      clinicId!,
      req.user!.id,
      lastSyncTimestamp as string,
      []
    );

    const totalUpdates =
      result.serverUpdates.patients.length +
      result.serverUpdates.vitals.length +
      result.serverUpdates.consultations.length +
      result.serverUpdates.bills.length +
      result.serverUpdates.appointments.length;

    return successResponse(
      res,
      {
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
      "Sync status retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get sync status error:", error);
    return serverErrorResponse(res, "Failed to get sync status", error);
  }
};

export const fullSync = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req;

    logger.info(`Full sync requested for clinic: ${clinicId}`);

    const result = await syncService.processSync(
      clinicId!,
      req.user!.id,
      null,
      []
    );

    return successResponse(res, result, "Full synchronization completed");
  } catch (error: any) {
    logger.error("Full sync error:", error);
    return serverErrorResponse(res, "Full synchronization failed", error);
  }
};
