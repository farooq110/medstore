import { Router, Response } from "express";
import Item from "../../models/item.model";
import Alert from "../../models/alert.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { isExpiringsoon, isExpired, generateSKU } from "../../Helper/utils";

const router = Router();

// Get all items with filters (search, category, lowStock, expiringSoon)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { search, category, lowStock, expiringSoon, page = 1, limit = 20 } = req.query;

    // Parse pagination parameters
    const numericPage = Math.max(1, parseInt(page as string) || 1);
    const numericLimit = Math.max(1, parseInt(limit as string) || 10);
    const skip = (numericPage - 1) * numericLimit;

    const query: any = { business: req.user.business, 
      // isActive: true
     };
    
    // Category filter
    if (req.query.categoryIds) {
      const ids = Array.isArray(req.query.categoryIds) ? req.query.categoryIds : [req.query.categoryIds];
      query.category = { $in: ids };
    } else if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Low stock filter
    if (lowStock === 'true') {
      query.$expr = { $lte: ["$stockQuantity", "$lowStockThreshold"] };
    }

    // Expiring soon filter (30 days)
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query.expiryDate = { $lte: thirtyDaysFromNow, $gt: new Date() };
    }

    // Get total count and paginated data
    const total = await Item.countDocuments(query);
    const pages = Math.ceil(total / numericLimit);

    const items = await Item.find(query)
      .populate("category")
      .skip(skip)
      .limit(numericLimit)
      .sort({ createdAt: -1 });

    const itemsWithStatus = items.map((item) => ({
      ...item.toObject(),
      expiryDaysLeft: new Date(item.expiryDate).getTime() - Date.now(),
      isExpired: isExpired(item.expiryDate),
      isExpiringSoon: isExpiringsoon(item.expiryDate),
      isLowStock: item.stockQuantity <= item.lowStockThreshold,
    }));

    return res.json({
      success: true,
      data: itemsWithStatus,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        totalCount: total,
        hasMore: numericPage < pages,
        pages,
      },
      msg: "Items fetched successfully",
    });
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Create item
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { name, category, stockQuantity, lowStockThreshold, expiryDate, sellingPrice, costPrice } =
      req.body;

    if (!name || !category || !sellingPrice || !expiryDate) {
      return errorResponse(res, "Required fields: name, category, sellingPrice, expiryDate", 400);
    }

    const sku = generateSKU();

    const item = new Item({
      name,
      category,
      stockQuantity: stockQuantity || 0,
      lowStockThreshold: lowStockThreshold || 10,
      sellingPrice,
      costPrice,
      expiryDate,
      sku,
      isExpired: isExpired(new Date(expiryDate)),
      business: req.user.business,
    });

    await item.save();
    return successResponse(res, item, "Item created successfully", 201);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get items with low stock
router.get("/low-stock", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const items = await Item.find({
      business: req.user.business,
      $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
    });

    return successResponse(res, items);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get expiring soon items
router.get("/expiring-soon", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const items = await Item.find({
      business: req.user.business,
      expiryDate: { $lte: thirtyDaysFromNow, $gt: new Date() },
    });

    return successResponse(res, items);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get item by ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const item = await Item.findOne({ _id: req.params.id, business: req.user.business }).populate("category") ;
    if (!item) {
      return errorResponse(res, "Item not found", 404);
    }
    return successResponse(res, item);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Update item
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { name, category, stockQuantity, lowStockThreshold, sellingPrice, costPrice, expiryDate } = req.body;

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, business: req.user.business },
      {
        name,
        category,
        stockQuantity,
        lowStockThreshold,
        sellingPrice,
        costPrice,
        expiryDate,
        isExpired: isExpired(new Date(expiryDate)),
      },
      { new: true }
    );

    
    if (!item) {
      return errorResponse(res, "Item not found", 404);
    }

    if (item.stockQuantity <= item.lowStockThreshold) {
      // Check if active alert already exists to avoid duplication
      const existingAlert = await Alert.findOne({
        itemId: item._id,
        type: "low_stock",
        resolved: false,
        business: req.user.business
      });

      if (!existingAlert) {
        await Alert.create({
          itemId: item._id,
          type: "low_stock",
          message: `Item ${item.name} is low in stock`,
          threshold: item.lowStockThreshold,
          currentStock: item.stockQuantity,
          business: req.user.business,
        });
      }
    }

    return successResponse(res, item, "Item updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Delete item
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const item = await Item.findOneAndUpdate({ _id: req.params.id, business: req.user.business }, { isActive: false });

    if (!item) {
      return errorResponse(res, "Item not found", 404);
    }

    // Also delete any related alerts for this item
    await Alert.deleteMany({ itemId: req.params.id, business: req.user.business });

    return successResponse(res, { id: req.params.id }, "Item deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
