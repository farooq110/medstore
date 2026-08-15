import { Router, Response } from "express";
import Client from "../../models/client.model";
import User from "../../models/user.model";
import Order from "../../models/order.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { requireRole } from "../../Helper/auth.helper";

const router = Router();

// Get all clients
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { search, page = 1, limit = 20 } = req.query;

    // Parse pagination parameters
    const numericPage = Math.max(1, parseInt(page as string) || 1);
    const numericLimit = Math.max(1, parseInt(limit as string) || 10);
    const skip = (numericPage - 1) * numericLimit;

    let query: any = { business: req.user.business };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
      ];
    }

    // Sales person only see their assigned clients (via salesPerson field)
    if (req.user?.role === "sales_person") {
      query.salesPerson = req.user.id;
      query.isActive = true; // Sales person should only see active clients
    }

    // Get total count and paginated data
    const total = await Client.countDocuments(query);
    const pages = Math.ceil(total / numericLimit);

    let clientQuery = Client.find(query);

    // Don't populate salesPerson if the requester is a sales person
    if (req.user?.role !== "sales_person") {
      clientQuery = clientQuery.populate('salesPerson', 'name email phone');
    }

    const clients = await clientQuery
      .skip(skip)
      .limit(numericLimit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: clients,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        totalCount: total,
        hasMore: numericPage < pages,
        pages,
      },
      msg: "Clients fetched successfully",
    });
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Create client
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { name, phone, email, address, shopName, creditLimit, salesPerson, ntn } = req.body;

    if (!name || !phone || !address) {
      return errorResponse(res, "Name, phone, and address are required", 400);
    }

    // Validate salesPerson if provided
    if (salesPerson) {
      const user = await User.findById(salesPerson);
      if (!user || user.business?.toString() !== req.user.business.toString() || user.role !== 'sales_person') {
        return errorResponse(res, "Invalid sales person", 400);
      }
    }

    const client = new Client({
      name,
      phone,
      email,
      address,
      shopName,
      creditLimit: creditLimit || 50000,
      salesPerson: salesPerson || null,
      business: req.user.business,
      ntn: ntn || "",
    });

    await client.save();
    
    // Populate salesPerson field before returning
    await client.populate('salesPerson', 'name email phone');
    
    return successResponse(res, client, "Client created successfully", 201);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get client by ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const client = await Client.findById(req.params.id);
    if (!client || client.business?.toString() !== req.user.business.toString()) {
      return errorResponse(res, "Client not found", 404);
    }

    // Don't populate salesPerson if the requester is a sales person
    if (req.user?.role !== "sales_person") {
      await client.populate('salesPerson', 'name email phone');
    }

    return successResponse(res, client);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get client detail with analytics (all calculations done in MongoDB query)
router.get("/:id/detail", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const ObjectId = require('mongoose').Types.ObjectId;
    const clientId = new ObjectId(req.params.id);
    const businessId = new ObjectId(req.user.business);

    // Single aggregation query with all calculations
    const result = await Client.aggregate([
      {
        $match: {
          _id: clientId,
          business: businessId,
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: { clientId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$client', '$$clientId'] },
                    { $eq: ['$business', businessId] },
                  ],
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
          ],
          as: 'orders',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'salesPerson',
          foreignField: '_id',
          as: 'salesPersonData',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                phone: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          // Only include salesPerson data if not a sales_person
          salesPerson: {
            $cond: [
              { $eq: [req.user.role, 'sales_person'] },
              null,
              { $arrayElemAt: ['$salesPersonData', 0] },
            ],
          },
          // Order calculations
          'analytics.orders.total': { $size: '$orders' },
          'analytics.orders.completed': {
            $size: {
              $filter: {
                input: '$orders',
                as: 'order',
                cond: { $eq: ['$$order.orderStatus', 'completed'] },
              },
            },
          },
          'analytics.orders.pending': {
            $size: {
              $filter: {
                input: '$orders',
                as: 'order',
                cond: {
                  $in: ['$$order.orderStatus', ['created', 'assigned']],
                },
              },
            },
          },
          // Payment calculations
          'analytics.payment.totalAmount': {
            $sum: '$orders.totalAmount',
          },
          'analytics.payment.totalPaid': {
            $sum: '$orders.paidAmount',
          },
          // Credit calculations
          'analytics.credit.creditLimit': '$creditLimit',
          'analytics.credit.outstanding': '$totalDue',
          // Get recent orders (last 10)
          recentOrders: {
            $slice: ['$orders', 10],
          },
        },
      },
      {
        $addFields: {
          // Derived calculations
          'analytics.payment.totalDue': {
            $subtract: [
              '$analytics.payment.totalAmount',
              '$analytics.payment.totalPaid',
            ],
          },
          'analytics.orders.avgOrderValue': {
            $cond: [
              { $eq: ['$analytics.orders.total', 0] },
              0,
              {
                $divide: [
                  '$analytics.payment.totalAmount',
                  '$analytics.orders.total',
                ],
              },
            ],
          },
          'analytics.payment.paymentRate': {
            $cond: [
              { $eq: ['$analytics.payment.totalAmount', 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      '$analytics.payment.totalPaid',
                      '$analytics.payment.totalAmount',
                    ],
                  },
                  100,
                ],
              },
            ],
          },
          'analytics.credit.available': {
            $max: [
              0,
              {
                $subtract: [
                  '$creditLimit',
                  '$totalDue',
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          'analytics.credit.utilization': {
            $cond: [
              { $eq: ['$creditLimit', 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: ['$totalDue', '$creditLimit'],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          'analytics.credit.status': {
            $cond: [
              { $gte: ['$analytics.credit.utilization', 100] },
              'danger',
              {
                $cond: [
                  { $gte: ['$analytics.credit.utilization', 80] },
                  'warning',
                  'success',
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          recentOrders: {
            $map: {
              input: '$recentOrders',
              as: 'order',
              in: {
                _id: '$$order._id',
                orderNumber: '$$order.orderNumber',
                createdAt: '$$order.createdAt',
                orderStatus: '$$order.orderStatus',
                totalAmount: '$$order.totalAmount',
                paidAmount: '$$order.paidAmount',
                dueAmount: '$$order.dueAmount',
                paymentStatus: '$$order.paymentStatus',
              },
            },
          },
        },
      },
      {
        $project: {
          orders: 0,
          salesPersonData: 0,
          business: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      {
        $addFields: {
          client: {
            _id: '$_id',
            name: '$name',
            phone: '$phone',
            email: '$email',
            address: '$address',
            shopName: '$shopName',
            totalDue: '$totalDue',
            creditLimit: '$creditLimit',
            isActive: '$isActive',
            salesPerson: '$salesPerson',
            ntn: '$ntn',
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: 0,
          phone: 0,
          email: 0,
          address: 0,
          shopName: 0,
          totalDue: 0,
          creditLimit: 0,
          isActive: 0,
          salesPerson: 0,
          ntn: 0,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return errorResponse(res, "Client not found", 404);
    }

    return successResponse(res, result[0]);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get client dues
router.get("/:id/dues", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const client = await Client.findById(req.params.id);
    if (!client || client.business?.toString() !== req.user.business.toString()) {
      return errorResponse(res, "Client not found", 404);
    }

    const orders = await Order.find({
      client: req.params.id,
      business: req.user.business,
      paymentStatus: { $in: ["partial", "pending", "borrow"] },
    });

    return successResponse(res, {
      client: { id: client._id, name: client.name },
      totalDue: client.totalDue,
      creditLimit: client.creditLimit,
      availableCredit: Math.max(0, client.creditLimit - client.totalDue),
      pendingOrders: orders.map((order) => ({
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
      })),
    });
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Update client
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return errorResponse(res, "Business not found", 400);
    }

    const { name, phone, email, address, shopName, creditLimit, isActive, salesPerson, ntn } = req.body;
    
    // Verify client exists and belongs to business
    const client = await Client.findById(req.params.id);
    if (!client || client.business?.toString() !== req.user.business.toString()) {
      return errorResponse(res, "Client not found", 404);
    }

    // Validate salesPerson if provided
    if (salesPerson) {
      const user = await User.findById(salesPerson);
      if (!user || user.business?.toString() !== req.user.business.toString() || user.role !== 'sales_person') {
        return errorResponse(res, "Invalid sales person", 400);
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(address && { address }),
        ...(shopName !== undefined && { shopName }),
        ...(creditLimit !== undefined && { creditLimit }),
        ...(isActive !== undefined && { isActive }),
        ...(salesPerson !== undefined && { salesPerson: salesPerson || null }),
        ...(ntn !== undefined && { ntn }),
      },
      { new: true }
    );

    // Populate salesPerson field before returning
    await updatedClient?.populate('salesPerson', 'name email phone');

    return successResponse(res, updatedClient, "Client updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Deactivate client
router.put("/:id/deactivate", async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, business: req.user?.business },
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return errorResponse(res, "Client not found", 404);
    }

    return successResponse(res, client, "Client deactivated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Activate client
router.put("/:id/activate", async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, business: req.user?.business },
      { isActive: true },
      { new: true }
    );

    if (!client) {
      return errorResponse(res, "Client not found", 404);
    }

    return successResponse(res, client, "Client activated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
