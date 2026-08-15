import { Router, Response } from "express";
import Config from "../../models/config.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";

const router = Router();

/**
 * PUBLIC ENDPOINT: Get latest app version
 * Mobile app calls this to check if update is available
 * No authentication required
 */
router.get(
  "/app-version",
  async (req: AuthRequest, res: Response) => {
    try {
      const config = await Config.findOne();

      if (!config) {
        return successResponse(
          res,
          { version: "1.0.0" },
          "No version configured, using default"
        );
      }

      return successResponse(
        res,
        { version: config.version },
        "Latest app version retrieved"
      );
    } catch (error) {
      console.error("Error getting app version:", error);
      return successResponse(
        res,
        { version: "1.0.0" },
        "Using default version due to error"
      );
    }
  }
);

export default router;
