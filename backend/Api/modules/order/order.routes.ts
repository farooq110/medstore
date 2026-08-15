import { Router, Response } from "express";
import mongoose from "mongoose";
import Order from "../../models/order.model";
import Item from "../../models/item.model";
import Client from "../../models/client.model";
import Alert from "../../models/alert.model";
import Business from "../../models/business.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { generateOrderNumber } from "../../Helper/utils";
import { sendEmail, generateInvoiceEmailHtml } from "../../Helper/mail.helper";

const router = Router();

// Create order
router.post("/", async (req: AuthRequest, res: Response) => {
  // Follows the example: explicit session.startTransaction / commit / abort
  const session = await mongoose.startSession();
  // Begin transaction
  await session.startTransaction();
  try {
    const {
      clientId,
      items,
      discount = 0,
      orderType = "delivery",
      notes,
      assignedTo,
      assignedFor,
      cashGiven = 0,
    } = req.body;

    if (!clientId || !items || items.length === 0) {
      return errorResponse(res, "Client ID and items are required", 400);
    }

    // Parse and validate discount percentage
    const discountPercentage = Math.min(
      100,
      Math.max(0, parseFloat(discount) || 0),
    );

    const client = await Client.findOne({
      _id: clientId,
      business: req.user?.business,
    });
    if (!client) {
      return errorResponse(res, "Client not found or unauthrorized", 404);
    }

    // Sales person can only create orders for their own clients
    if (req.user?.role === "sales_person") {
      const isMySalesClient =
        client.salesPerson?.toString() === req.user.id.toString();
      if (!isMySalesClient && client.salesPerson) {
        return errorResponse(
          res,
          "You can only create orders for your own clients",
          403,
        );
      }
      // Sales person can only assign to themselves
      if (assignedTo && assignedTo.toString() !== req.user.id.toString()) {
        return errorResponse(
          res,
          "You can only assign orders to yourself",
          403,
        );
      }
    }

    // helper: validate stock availability (basic checks)
    const validateStockAvailability = async (
      orderItems: any[],
      session: any,
    ) => {
      // Basic validation: ensure quantities are positive and item ids provided
      for (const it of orderItems) {
        if (!it.itemId || !it.quantity || it.quantity <= 0) {
          const err: any = new Error("Invalid item data");
          err.name = "ValidationError";
          throw err;
        }
        /* BACKORDER FEATURE DISABLED - We allow backorders and placeholders; no strict failure here */
      }
    };

    // helper: process items, allocate stock, create alerts and return allocation summary
    const processOrderItems = async (
      orderId: any,
      orderItemsPayload: any[],
      discountPercentage: number,
      session: any,
    ) => {
      let subtotalLocal = 0;
      /* BACKORDER FEATURE DISABLED - let hasBackorderLocal = false; */
      let hasBackorderLocal = false; // Always false - backorder feature disabled
      const finalOrderItems: any[] = [];

      for (const it of orderItemsPayload) {
        const dbItem = await Item.findOne({
          _id: it.itemId,
          business: req.user?.business,
        });
        if (!dbItem) {
          /* BACKORDER FEATURE DISABLED - Placeholder and backorder creation
          // create placeholder and record as backorder
          const newItem = new Item({
            name: it.itemName || 'Unknown',
            category: 'Backorder',
            stockQuantity: 0,
            lowStockThreshold: 10,
            sellingPrice: it.sellingPrice || 0,
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          });
          await newItem.save({ session });

          finalOrderItems.push({
            itemId: newItem._id,
            itemName: it.itemName,
            quantity: it.quantity,
            sellingPrice: it.sellingPrice,
            subtotal: it.quantity * (it.sellingPrice || 0),
            expiryDate: newItem.expiryDate,
            isBackorder: true,
          });

          subtotalLocal += it.quantity * (it.sellingPrice || 0);
          hasBackorderLocal = true;

          const alert = new Alert({
            type: 'backorder_pending',
            itemId: newItem._id,
            orderId,
            message: `Backorder: ${it.itemName} - ${it.quantity} units needed`,
            severity: 'warning',
          });
          await alert.save({ session });
          */
          // Item not found - skip or reject
          continue;
        } else {
          const availableQty = dbItem.stockQuantity || 0;
          const requestedQty = it.quantity;
          const sellingPrice = it.sellingPrice || dbItem.sellingPrice || 0;

          /* BACKORDER FEATURE DISABLED - Allow all items to be added to order
          Even if stock is 0 or insufficient, items are still added to show what was ordered.
          The frontend can display items with 0 stock as "Out of Stock" status. */

          // Deduct available stock from inventory (if any exists)
          if (availableQty > 0) {
            const deductQty = Math.min(availableQty, requestedQty);
            dbItem.stockQuantity = availableQty - deductQty;
            await dbItem.save({ session });

            // Low stock alert (deduped): create when stock becomes low due to this order
            const remainingQty = dbItem.stockQuantity ?? 0;
            const thresholdQty = dbItem.lowStockThreshold ?? 0;
            if (remainingQty > 0 && remainingQty <= thresholdQty) {
              const existingLowStock = await Alert.findOne({
                type: "low_stock",
                itemId: dbItem._id,
                resolved: false,
              }).session(session);

              if (!existingLowStock) {
                const lowStockAlert = new Alert({
                  type: "low_stock",
                  itemId: dbItem._id,
                  orderId,
                  message: `${dbItem.name}: Stock is low (${remainingQty} remaining, threshold ${thresholdQty})`,
                  severity: "warning",
                  business: req.user?.business,
                });
                await lowStockAlert.save({ session });
              }
            }
          } else {
            const outOfStock = await Alert.findOne({
              type: "out_of_stock",
              itemId: dbItem._id,
              resolved: false,
            }).session(session);

            if (outOfStock) {
              // Item is out of stock - create alert
              const outOfStockAlert = new Alert({
                type: "out_of_stock",
                itemId: dbItem._id,
                orderId,
                message: `${dbItem.name}: Out of stock - 0 units available`,
                severity: "warning",
                business: req.user?.business,
              });
              await outOfStockAlert.save({ session });
            }
          }

          // Add item to order regardless of stock availability
          // This ensures all requested items appear in the order
          finalOrderItems.push({
            itemId: dbItem._id,
            itemName: dbItem.name,
            quantity: requestedQty,
            sellingPrice: sellingPrice,
            subtotal: requestedQty * sellingPrice,
            expiryDate: dbItem.expiryDate,
            isBackorder: false,
          });

          subtotalLocal += requestedQty * sellingPrice;
        }
      }

      // Update order with items & subtotal
      const discountAmountLocal = (subtotalLocal * discountPercentage) / 100;
      const totalAmountLocal = subtotalLocal - discountAmountLocal;

      await Order.findOneAndUpdate(
        { _id: orderId, business: req.user?.business },
        {
          items: finalOrderItems,
          subtotal: subtotalLocal,
          discount: discountAmountLocal,
          totalAmount: totalAmountLocal,
          dueAmount: totalAmountLocal,
          /* BACKORDER FEATURE DISABLED - Was: orderStatus: hasBackorderLocal ? 'backorder' : 'created', */
          orderStatus: "assigned",
        },
        { session },
      );

      return {
        subtotal: subtotalLocal,
        totalAmount: totalAmountLocal,
        hasBackorder: hasBackorderLocal,
        items: finalOrderItems,
      };
    };

    try {
      // Preliminary validation
      await validateStockAvailability(items, session);

      // For POS orders, we need to calculate total first to validate cash payment
      // This is a preliminary check before creating the order
      if (orderType === "pos") {
        // Calculate subtotal to validate POS payment
        let preliminarySubtotal = 0;
        for (const it of items) {
          const dbItem = await Item.findOne({
            _id: it.itemId,
            business: req.user?.business,
          }).session(session);
          if (dbItem) {
            preliminarySubtotal +=
              it.quantity * (it.sellingPrice || dbItem.sellingPrice || 0);
          }
        }
        const preliminaryDiscount =
          (preliminarySubtotal * discountPercentage) / 100;
        const preliminaryTotal = preliminarySubtotal - preliminaryDiscount;
        const cashGivenAmount = Math.max(0, parseFloat(cashGiven as any) || 0);

        // Validate: for POS, cashGiven must be >= totalAmount
        if (cashGivenAmount < preliminaryTotal) {
          await session.abortTransaction();
          return errorResponse(
            res,
            `Insufficient payment. Amount due: ${preliminaryTotal.toFixed(2)}, Cash given: ${cashGivenAmount.toFixed(2)}`,
            400,
          );
        }
      }

      // Create initial order record (pending)
      const [order] = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            orderType,
            client: clientId,
            business: req.user?.business,
            createdBy: req.user?.id,
            assignedTo: assignedTo ?? undefined,
            assignedFor,
            assignedAt: assignedTo ? new Date() : undefined,
            items: [],
            subtotal: 0,
            discount: 0,
            totalAmount: 0,
            dueAmount: 0,
            paidAmount: 0,
            paymentStatus: "pending",
            orderStatus: "created",
            notes,
            payments: [],
          },
        ],
        { session },
      );

      if (!order) {
        await session.abortTransaction();
        return errorResponse(res, "Failed to create order", 500);
      }

      // Process items and update inventory within the same transaction
      const allocation = await processOrderItems(
        order._id,
        items,
        discountPercentage,
        session,
      );

      /* BACKORDER FEATURE DISABLED - Status adjustment based on backorder
      let finalStatus = allocation.hasBackorder ? 'backorder' : 'created';
      if (!allocation.hasBackorder && assignedTo) {
        finalStatus = 'assigned';
      }

      // If POS and no backorder, mark completed
      if (orderType === 'pos' && !allocation.hasBackorder) {
        await Order.findOneAndUpdate(
          { _id: order._id, business: req.user?.business },
          {
            orderStatus: 'completed',
            paymentStatus: 'fully_paid',
            paidAmount: allocation.totalAmount,
            dueAmount: 0,
          },
          { session }
        );
      } else if (finalStatus !== 'created') {
        // Update to assigned or backorder if not handled by POS completion
        await Order.findOneAndUpdate(
          { _id: order._id, business: req.user?.business },
          { orderStatus: finalStatus },
          { session }
        );
      }
      */

      // BACKORDER FEATURE DISABLED - Always use 'created' or 'assigned' status
      let finalStatus = "created";
      // Only set to 'assigned' if assignedTo is provided AND it's not a self-assignment by sales_person
      if (assignedTo && req.user?.role !== "sales_person") {
        finalStatus = "assigned";
      }

      // If POS, mark completed
      if (orderType === "pos") {
        const cashGivenAmount = Math.max(0, parseFloat(cashGiven as any) || 0);

        // Automatically record the full payment for POS orders
        await Order.findOneAndUpdate(
          { _id: order._id, business: req.user?.business },
          {
            orderStatus: "completed",
            paymentStatus: "fully_paid",
            paidAmount: allocation.totalAmount,
            dueAmount: 0,
            $push: {
              payments: {
                amount: allocation.totalAmount,
                method: "cash",
                recordedBy: req.user?.id,
                recordedAt: new Date(),
                notes: `POS Order - Change: ${(cashGivenAmount - allocation.totalAmount).toFixed(2)}`,
              },
            },
          },
          { session },
        );
      } else if (finalStatus !== "created") {
        // Update to assigned if not handled by POS completion
        await Order.findOneAndUpdate(
          { _id: order._id, business: req.user?.business },
          { orderStatus: finalStatus },
          { session },
        );
      }

      await session.commitTransaction();

      // Return the updated order (populate if needed)
      const created = await Order.findById(order._id)
        .populate("client", "name phone email")
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");

      return successResponse(res, created, "Order created successfully", 201);
    } catch (err: any) {
      await session.abortTransaction();
      throw err;
    }
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  } finally {
    session.endSession();
  }
});

// Get orders with filters
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const {
      status,
      clientId,
      clientIds,
      type,
      search,
      page = 1,
      limit = 20,
      paymentStatus,
    } = req.query;

    // Parse pagination parameters
    const numericPage = Math.max(1, parseInt(page as string) || 1);
    const numericLimit = Math.max(1, parseInt(limit as string) || 10);
    const skip = (numericPage - 1) * numericLimit;

    const query: any = {
      business: req.user?.business,
    };
    if (status && status !== "all") query.orderStatus = status;

    // Support payment status filtering - handles both single and multiple values
    if (paymentStatus) {
      if (Array.isArray(paymentStatus)) {
        // Multiple payment statuses - use $in operator
        query.paymentStatus = { $in: paymentStatus };
      } else {
        // Single payment status
        query.paymentStatus = paymentStatus;
      }
    }

    // Support single clientId or multiple clientIds filtering
    if (clientId) {
      query.client = clientId;
    } else if (clientIds) {
      const ids = Array.isArray(clientIds) ? clientIds : [clientIds];
      query.client = { $in: ids };
    }

    if (type) query.orderType = type;

    if (search) {
      query.orderNumber = { $regex: search, $options: "i" };
    }

    // Filter by role - sales persons see different orders based on status
    if (req.user?.role === "sales_person") {
      if (status === "created") {
        // Sales person sees orders CREATED BY them OR assigned to themselves
        query.createdBy = req.user.id;
        delete query.orderStatus; // Show only created orders that are still assigned (not completed or backorder)
      } else if (status === "assigned") {
        // Sales person sees orders ASSIGNED TO them by others (not self-assigned)
        query.assignedTo = req.user.id;
        query.createdBy = { $ne: req.user.id }; // Exclude self-created
      } else {
        // For other statuses or no status, show both created by and assigned to
        query.$or = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];
      }
    }

    // Get total count and paginated data
    const total = await Order.countDocuments(query);
    const pages = Math.ceil(total / numericLimit);

    const orders = await Order.find(query)
      .populate("client", "name phone email address shopName")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .skip(skip)
      .limit(numericLimit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        totalCount: total,
        hasMore: numericPage < pages,
        pages,
      },
      msg: "Orders fetched successfully",
    });
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get order by ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      business: req.user?.business,
    })
      .populate("client")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("items.itemId")
      .populate("business");

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    return successResponse(res, order);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Assign order to sales person
router.put("/:id/assign", async (req: AuthRequest, res: Response) => {
  try {
    const { salesPersonId, assignFor = "delivery" } = req.body;

    if (!salesPersonId || !assignFor) {
      return errorResponse(
        res,
        "Sales person ID and assignFor are required",
        400,
      );
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, business: req.user?.business },
      {
        assignedTo: salesPersonId,
        assignedFor: assignFor,
        assignedAt: new Date(),
        orderStatus: "assigned",
      },
      { new: true },
    ).populate("assignedTo", "name email phone");

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    return successResponse(res, order, "Order assigned successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Mark order as delivered
router.put("/:id/mark-delivered", async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, business: req.user?.business },
      {
        isDelivered: true,
        deliveredAt: new Date(),
        assignedFor: "payment_collection", // Change assigned task to payment collection
      },
      { new: true },
    );

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    return successResponse(res, order, "Order marked as delivered");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Mark due as collected
router.put(
  "/:id/mark-due-collected",
  async (req: AuthRequest, res: Response) => {
    try {
      const order = await Order.findOneAndUpdate(
        { _id: req.params.id, business: req.user?.business },
        {
          dueCollected: true,
          dueCollectedAt: new Date(),
          dueAmount: 0,
          paymentStatus: "fully_paid",
          orderStatus: "completed",
        },
        { new: true },
      );

      if (!order) {
        return errorResponse(res, "Order not found", 404);
      }

      return successResponse(res, order, "Due collected successfully");
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  },
);

// Mark items provided (legacy - kept for compatibility)
router.put("/:id/items-provided", async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, business: req.user?.business },
      {
        isDelivered: true,
        deliveredAt: new Date(),
        assignedFor: "payment_collection", // Change assigned task to payment collection
      },
      { new: true },
    );

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    return successResponse(res, order, "Items marked as provided");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Record payment
router.put("/:id/payment", async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method = "cash", notes } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      business: req.user?.business,
    });
    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    const newPaidAmount = order.paidAmount + amount;
    const newDueAmount = Math.max(0, order.totalAmount - newPaidAmount);

    let paymentStatus: "partial" | "pending" | "fully_paid" | "borrow" =
      "pending";
    if (newPaidAmount === 0) {
      paymentStatus = "borrow";
    } else if (newPaidAmount < order.totalAmount) {
      paymentStatus = "partial";
    } else {
      paymentStatus = "fully_paid";
    }

    order.paidAmount = newPaidAmount;
    order.dueAmount = newDueAmount;
    order.paymentStatus = paymentStatus;

    order.payments.push({
      amount,
      method: method as any,
      recordedBy: req.user?.id as any,
      recordedAt: new Date(),
      notes,
    });

    if (newDueAmount === 0) {
      order.orderStatus = "completed";
    }
    // Keep current status if due is pending

    await order.save();

    // Update client total due
    const allOrders = await Order.find({
      client: order.client,
      paymentStatus: { $in: ["partial", "pending", "borrow"] },
    });

    const totalDue = allOrders.reduce((sum, o) => sum + o.dueAmount, 0);
    await Client.findOneAndUpdate(
      { _id: order.client, business: req.user?.business },
      { totalDue },
    );

    return successResponse(res, order, "Payment recorded successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get order status counts
router.get(
  "/statistics/status-counts",
  async (req: AuthRequest, res: Response) => {
    try {
      const baseQuery: any = { business: req.user?.business };

      let createdCount = 0;
      let assignedCount = 0;
      let completedCount = 0;
      let totalOrderCount = 0;

      if (req.user?.role === "sales_person") {
        // For sales person:
        // created = orders created by them OR assigned to them
        createdCount = await Order.countDocuments({
          ...baseQuery,
          createdBy: req.user.id,
        });
        // assigned = orders assigned to them by others (not self-created)
        assignedCount = await Order.countDocuments({
          ...baseQuery,
          orderStatus: "assigned",
          assignedTo: req.user.id,
          createdBy: { $ne: req.user.id },
        });
        // completed = all completed orders (created or assigned)
        completedCount = await Order.countDocuments({
          ...baseQuery,
          orderStatus: "completed",
          $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
        });
        // total = all orders (created or assigned to sales person)
        totalOrderCount = await Order.countDocuments({
          ...baseQuery,
          $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
        });
      } else {
        // For owner: show all counts (current logic)
        createdCount = await Order.countDocuments({
          ...baseQuery,
          orderStatus: "created",
        });
        assignedCount = await Order.countDocuments({
          ...baseQuery,
          orderStatus: "assigned",
        });
        completedCount = await Order.countDocuments({
          ...baseQuery,
          orderStatus: "completed",
        });
        // total = all orders for the business
        totalOrderCount = await Order.countDocuments(baseQuery);
      }

      return successResponse(
        res,
        {
          createdCount,
          assignedCount,
          completedCount,
          totalOrderCount,
        },
        "Order status counts fetched successfully",
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* BACKORDER FEATURE DISABLED - Mark backorder items as purchased endpoint
router.put("/:id/backorder-purchased", async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, business: req.user?.business });
    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    // Update backorder items to received stock
    for (const item of order.items) {
      if (item.isBackorder) {
        const dbItem = await Item.findById(item.itemId);
        if (dbItem) {
          dbItem.stockQuantity += item.quantity;
          await dbItem.save();
        }
      }
    }

    order.isBackorderComplete = true;
    order.orderStatus = "assigned";
    await order.save();

    return successResponse(res, order, "Backorder marked as purchased");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});
*/

// Share order via email
router.post("/:id/share/email", async (req: AuthRequest, res: Response) => {
  try {
    const { email: recipientEmail } = req.body;

    if (!recipientEmail) {
      return errorResponse(res, "Recipient email is required", 400);
    }

    const order = await Order.findOne({
      _id: req.params.id,
      business: req.user?.business,
    }).populate("client");

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    const business = await Business.findById(order.business);
    if (!business) {
      return errorResponse(res, "Business info not found", 404);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const publicLink = `${frontendUrl}/public/invoice/${order._id}/${order.shareToken}`;

    const emailHtml = generateInvoiceEmailHtml(order, business, publicLink);

    await sendEmail(
      recipientEmail,
      `Invoice for Order #${order.orderNumber} - ${business.name}`,
      emailHtml,
    );

    return successResponse(res, null, "Invoice email sent successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Sales Dashboard - Get dashboard data
router.get("/dashboard/sales", async (req: AuthRequest, res: Response) => {
  try {
    const query: any = { business: req.user?.business };

    // Filter by sales person
    if (req.user?.role === "sales_person") {
      query.$or = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];
    }

    // Get recent orders (limit 5)
    const recentOrders = await Order.find(query)
      .populate("client", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get status counts
    const createdCount = await Order.countDocuments({
      ...query,
      orderStatus: "created",
    });
    const assignedCount = await Order.countDocuments({
      ...query,
      orderStatus: "assigned",
    });
    const completedCount = await Order.countDocuments({
      ...query,
      orderStatus: "completed",
    });

    // Get total orders count
    const totalOrdersCount = await Order.countDocuments(query);

    // Get today's total revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get total revenue (all time)
    const totalRevenue = await Order.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get pending payment (due amount)
    const pendingPayment = await Order.aggregate([
      {
        $match: {
          ...query,
          $or: [{ paymentStatus: "pending" }, { paymentStatus: "partial" }],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$dueAmount" },
        },
      },
    ]);

    return successResponse(
      res,
      {
        recentOrders,
        statusCounts: {
          createdCount,
          assignedCount,
          completedCount,
        },
        revenueToday: todayRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrdersCount,
        pendingPayment: pendingPayment[0]?.total || 0,
      },
      "Sales dashboard data fetched successfully",
    );
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
