import { Router, Response } from "express";
import Alert from "../../models/alert.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";

const router = Router();

// Get all alerts
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { resolved = false, page = 1, limit = 20, type, severity } = req.query;
    const query: any = {
      resolved: resolved === "true",
      business: req.user.business,
    };

    // Add type filter if provided
    if (type && type !== "all") {
      query.type = type;
    }

    // Add severity filter if provided
    if (severity && severity !== "all") {
      query.severity = severity;
    }

    // Parse pagination parameters
    const numericPage = Math.max(1, parseInt(page as string) || 1);
    const numericLimit = Math.max(1, parseInt(limit as string) || 10);
    const skip = (numericPage - 1) * numericLimit;

    // Get total count and paginated data
    const total = await Alert.countDocuments(query);
    const pages = Math.ceil(total / numericLimit);

    const data = await Alert.find(query)
      .populate("itemId", "name stockQuantity")
      .populate("orderId", "orderNumber totalAmount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit);

    return res.json({
      data,
      pagination: {
        page: numericPage,
        totalCount: total,
        hasMore: numericPage < pages,
        pages,
      },
      msg: "Fetched successfully",
    });
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Mark alert as seen
router.put("/:id/seen", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { role } = req.user || {};
    const update: any = {};

    if (role === "owner") {
      update.seenByOwner = true;
    } else if (role === "sales_person") {
      update.seenBySalesPerson = true;
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, business: req.user.business },
      update,
      { new: true },
    );

    if (!alert) {
      return errorResponse(res, "Alert not found", 404);
    }

    return successResponse(res, alert, "Alert marked as seen");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Mark alert as resolved
router.put("/:id/resolve", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, business: req.user.business },
      { resolved: true },
      { new: true },
    );

    if (!alert) {
      return errorResponse(res, "Alert not found", 404);
    }

    return successResponse(res, alert, "Alert resolved");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get alert by ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const alert = await Alert.findOne({
      _id: req.params.id,
      business: req.user.business,
    })
      .populate("itemId", "name stockQuantity")
      .populate("orderId", "orderNumber totalAmount");

    if (!alert) {
      return errorResponse(res, "Alert not found", 404);
    }

    return successResponse(res, alert, "Alert fetched successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Delete alert
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      business: req.user.business,
    });

    if (!alert) {
      return errorResponse(res, "Alert not found", 404);
    }

    return successResponse(res, alert, "Alert deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
