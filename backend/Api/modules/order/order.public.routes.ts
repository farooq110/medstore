import { Router, Response, Request } from "express";
import Order from "../../models/order.model";
import Business from "../../models/business.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";

const router = Router();

// Publicly fetch order details using a secure token
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return errorResponse(res, "Access token is required", 401);
    }

    const order = await Order.findOne({ _id: req.params.id, shareToken: token as string })
      .populate("client")
      .populate("items.itemId")
      .populate("createdBy", "name email");

    if (!order) {
      return errorResponse(res, "Order not found or invalid token", 404);
    }

    // Also fetch business info for the invoice header
    const business = await Business.findById(order.business).populate("owner", "name email phone");

    return successResponse(res, { order, business }, "Order fetched successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
