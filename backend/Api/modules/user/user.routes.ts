import { Router, Response } from "express";
import bcrypt from "bcrypt";
import User from "../../models/user.model";
import Order from "../../models/order.model";
import Client from "../../models/client.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { requireRole } from "../../Helper/auth.helper";
import crypto from "crypto";
import { sendEmail, generateWelcomeEmailHtml } from "../../Helper/mail.helper";
import Business from "../../models/business.model";

const router = Router();

// Get all users (Owner only)
router.get(
  "/",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { search, page = 1, limit = 20 } = req.query;

      if (!req.user?.business) {
        return errorResponse(res, "Business not found", 400);
      }

      // Parse pagination parameters
      const numericPage = Math.max(1, parseInt(page as string) || 1);
      const numericLimit = Math.max(1, parseInt(limit as string) || 10);
      const skip = (numericPage - 1) * numericLimit;

      const query: any = { 
        role: "sales_person",
        business: req.user.business,
      };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      // Get total count and paginated data
      const total = await User.countDocuments(query);
      const pages = Math.ceil(total / numericLimit);

      const users = await User.find(query)
        .select("-password")
        .populate("assignedClients", "name phone address shopName creditLimit")
        .skip(skip)
        .limit(numericLimit)
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: users,
        pagination: {
          page: numericPage,
          limit: numericLimit,
          totalCount: total,
          hasMore: numericPage < pages,
          pages,
        },
        msg: "Users fetched successfully",
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Get users with their assigned orders and clients
router.get(
  "/with-orders",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) {
        return errorResponse(res, "Business not found", 400);
      }

      const users = await User.find({ 
        isActive: true, 
        role: "sales_person",
        business: req.user.business,
      })
        .select("-password")
        .populate("assignedClients", "name phone email");

      // Get orders created by each sales person
      const usersWithOrders = await Promise.all(
        users.map(async (user) => {
          // Get orders created by this sales person
          const createdOrders = await Order.find({
            createdBy: user._id,
            business: req.user?.business,
            orderStatus: { $in: ["created", "completed" /* "backorder" BACKORDER FEATURE DISABLED */] }
          })
            .select("orderNumber totalAmount dueAmount orderStatus isDelivered")
            .populate("client", "name phone email");

          // Pending orders (not delivered)
          const pendingOrders = createdOrders.filter((order) => !order.isDelivered);
          
          // Delivered orders
          const deliveredOrders = createdOrders.filter((order) => order.isDelivered);

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            allOrders: createdOrders,
            pendingOrders,
            deliveredOrders,
            totalOrders: createdOrders.length,
            pendingCount: pendingOrders.length,
            deliveredCount: deliveredOrders.length,
          };
        })
      );

      return successResponse(res, usersWithOrders, "Users with orders fetched successfully");
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Create user (Owner only)
router.post(
  "/",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password || !phone) {
        return errorResponse(res, "All fields are required", 400);
      }

      if (!req.user?.business) {
        return errorResponse(res, "Business not found", 400);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return errorResponse(res, "User with this email already exists", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const resetToken = crypto.randomBytes(32).toString("hex");

      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        role: "sales_person",
        business: req.user.business,
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000 * 24), // 24 hours
      });

      await user.save();

      // Send welcome email
      const business = await Business.findById(req.user.business);
      if (business) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const emailHtml = generateWelcomeEmailHtml(user, business, resetLink);
        
        // We don't await this to keep the response fast, or we could if we want to ensure it's sent
        sendEmail(email, `Invitation to join ${business.name}`, emailHtml)
          .catch(err => console.error("Failed to send welcome email:", err));
      }

      return successResponse(
        res,
        { id: user._id, name: user.name, email: user.email, role: user.role },
        "User created and invitation email sent",
        201
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Get client options for select dropdown with isAssigned field
router.get(
  "/client-options",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) {
        return errorResponse(res, "Business not found", 400);
      }

      const isAssignedParam = (req.query.isAssigned as string);
      const { page = 1, limit = 10 } = req.query;

      // Parse pagination parameters
      const numericPage = Math.max(1, parseInt(page as string) || 1);
      const numericLimit = Math.max(1, parseInt(limit as string) || 10);
      const skip = (numericPage - 1) * numericLimit;

      // Build aggregation pipeline
      const pipeline: any[] = [
        // Match active clients in this business
        {
          $match: {
            isActive: true,
            business: req.user.business,
          },
        },
        // Add isAssigned field - true if client has a salesPerson assigned
        {
          $addFields: {
            isAssigned: { $ne: ["$salesPerson", null] },
          },
        },
        // Project only needed fields
        {
          $project: {
            _id: 1,
            name: 1,
            phone: 1,
            email: 1,
            shopName: 1,
            isAssigned: 1,
          },
        },
      ];

      // Apply isAssigned filter if specified
      if (isAssignedParam === 'true') {
        pipeline.push({
          $match: { isAssigned: true },
        });
      } else if (isAssignedParam === 'false') {
        pipeline.push({
          $match: { isAssigned: false },
        });
      }

      // Get total count before pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Client.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;
      const pages = Math.ceil(total / numericLimit);

      // Add pagination to pipeline
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: numericLimit });

      // Execute aggregation
      const clientOptions = await Client.aggregate(pipeline);

      return res.json({
        success: true,
        data: clientOptions.map((client: any) => ({
          _id: client._id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          shop: client.shopName,
          isAssigned: client.isAssigned,
        })),
        pagination: {
          page: numericPage,
          totalCount: total,
          hasMore: numericPage < pages,
          pages,
        },
        msg: "Client options fetched successfully",
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Get user by ID with assigned clients and orders with calculations
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.params.id, business: req.user?.business })
      .select("-password")
      .populate("assignedClients", "name phone email shopName address creditLimit dueAmount");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Get all orders created by this sales person
    const allOrders = await Order.find({ 
      createdBy: user._id,
      business: user.business,
    })
      .select("orderNumber totalAmount dueAmount paidAmount orderStatus isDelivered createdAt")
      .populate("client", "name phone email");

    // Calculate statistics
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter((o) => o.orderStatus === "completed").length;
    const pendingOrders = allOrders.filter((o) => o.orderStatus !== "completed").length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDueCollected = allOrders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
    const pendingDueAmount = allOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return successResponse(res, {
      ...user.toObject(),
      orders: allOrders,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        totalDueCollected,
        pendingDueAmount,
        averageOrderValue,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        collectionRate: totalRevenue > 0 ? (totalDueCollected / totalRevenue) * 100 : 0,
      },
    });
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Update user
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, isActive } = req.body;
    const updateData: any = { name, phone, isActive };
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, business: req.user?.business },
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (isActive === false) {
      await Client.updateMany(
        { salesPerson: req.params.id, business: req.user?.business },
        { $set: { salesPerson: null } }
      );
    }

    return successResponse(res, user, "User updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Assign clients to a sales person
router.post(
  "/assign-clients/:salesPersonId",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) {
        return errorResponse(res, "Business not found", 400);
      }

      const { salesPersonId } = req.params;
      const { clientIds } = req.body;

      if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
        return errorResponse(res, "clientIds array is required and must not be empty", 400);
      }

      // Verify sales person exists and belongs to same business
      const salesPerson = await User.findById(salesPersonId);
      if (!salesPerson || salesPerson.role !== "sales_person" || salesPerson.business?.toString() !== req.user.business.toString()) {
        return errorResponse(res, "Sales person not found", 404);
      }

      // Check if any client is already assigned to another sales person
      const alreadyAssignedClients = await Client.find({
        _id: { $in: clientIds },
        $and: [
          { salesPerson: { $exists: true } },
          { salesPerson: { $ne: null } },
          { salesPerson: { $ne: salesPersonId } },
        ],
        business: req.user.business,
      }).select("name");

      if (alreadyAssignedClients.length > 0) {
        const clientNames = alreadyAssignedClients.map((c) => c.name).join(", ");
        return errorResponse(
          res,
          `The following clients are already assigned to another sales person: ${clientNames}`,
          400
        );
      }

      // Update Client documents to assign to sales person
      const result = await Client.updateMany(
        {
          _id: { $in: clientIds },
          business: req.user.business,
        },
        {
          salesPerson: salesPersonId,
        }
      );

      if (result.matchedCount === 0) {
        return errorResponse(res, "No clients found to assign", 404);
      }

      // Fetch updated clients
      const updatedClients = await Client.find({
        _id: { $in: clientIds },
      }).populate("salesPerson", "name email phone");

      return successResponse(
        res,
        updatedClients,
        "Clients assigned successfully",
        200
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Reassign clients from one sales person to another
router.put(
  "/reassign-clients/:clientId",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { clientId } = req.params;
      const { newSalesPersonId } = req.body;

      if (!newSalesPersonId) {
        return errorResponse(res, "newSalesPersonId is required", 400);
      }

      // Verify client exists
      const client = await Client.findOne({ _id: clientId, business: req.user?.business });
      if (!client) {
        return errorResponse(res, "Client not found", 404);
      }

      // Verify new sales person exists
      const newSalesPerson = await User.findById(newSalesPersonId);
      if (!newSalesPerson || newSalesPerson.role !== "sales_person" || newSalesPerson.business?.toString() !== req.user?.business.toString()) {
        return errorResponse(res, "Sales person not found", 404);
      }

      // Update client's salesPerson field
      const updatedClient = await Client.findByIdAndUpdate(
        clientId,
        { salesPerson: newSalesPersonId },
        { new: true }
      ).populate("salesPerson", "name email phone");

      return successResponse(
        res,
        updatedClient,
        "Client reassigned successfully",
        200
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Remove client from sales person
router.delete(
  "/remove-client/:clientId",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { clientId } = req.params;

      // Get client to verify it exists
      const client = await Client.findOne({ _id: clientId, business: req.user?.business });
      if (!client) {
        return errorResponse(res, "Client not found", 404);
      }

      // Remove sales person assignment (set to null)
      const updatedClient = await Client.findByIdAndUpdate(
        clientId,
        { salesPerson: null },
        { new: true }
      );

      return successResponse(res, updatedClient, "Client unassigned successfully", 200);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

export default router;
