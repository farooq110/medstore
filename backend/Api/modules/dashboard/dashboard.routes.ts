import { Router, Response } from "express";
import Order from "../../models/order.model";
import Item from "../../models/item.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";

const router = Router();

// Dashboard Summary endpoint
router.get("/summary", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const businessId = req.user.business;

    // ===== OPTIMIZED: Separate queries using Promise.all() =====
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expiringThresholdDate = new Date();
    expiringThresholdDate.setDate(expiringThresholdDate.getDate() + 30);

    const [
      totalOrdersCount,
      pendingOrdersData,
      thisMonthOrdersCount,
      lowStockCount,
      expiringCount
    ] = await Promise.all([
      // Total orders count
      Order.countDocuments({ business: businessId }),

      // Pending orders with due amount aggregation
      Order.aggregate([
        {
          $match: {
            business: businessId,
            orderStatus: { $ne: "completed" }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalDue: { $sum: { $ifNull: ["$dueAmount", 0] } }
          }
        }
      ]),

      // This month's orders count
      Order.countDocuments({
        business: businessId,
        createdAt: { $gte: firstDayOfMonth }
      }),

      // Low stock items count
      Item.countDocuments({
        business: businessId,
        $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
      }),

      // Expiring soon items count (within 30 days) OR already expired
      Item.countDocuments({
        business: businessId,
        $or: [
          {
            expiryDate: {
              $lte: expiringThresholdDate,
              $gte: new Date()
            },
            isExpired: false
          },
          { isExpired: true },
          { expiryDate: { $lt: new Date() } }
        ]
      })
    ]);

    // Extract values from aggregation results
    const outstandingPendingCount = pendingOrdersData[0]?.count || 0;
    const totalDue = pendingOrdersData[0]?.totalDue || 0;

    const summary = {
      totalOrders: totalOrdersCount,
      totalDue,
      lowStockItems: lowStockCount,
      expiringItems: expiringCount,
      thisMonthOrderCount: thisMonthOrdersCount,
      outstandingPendingCount,
      expiringThreshold: 30,
      currency: "PKR"
    };

    return successResponse(res, summary, "Dashboard summary retrieved successfully", 200);
  } catch (error: any) {
    console.error("Error fetching dashboard summary:", error);
    return errorResponse(res, error.message || "Error fetching dashboard summary", 500);
  }
});

export default router;
