import { Router, Response } from "express";
import Order from "../../models/order.model";
import Item from "../../models/item.model";
import Client from "../../models/client.model";
import Business from "../../models/business.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { requireRole } from "../../Helper/auth.helper";

const router = Router();

// Outstanding dues report
router.get(
  "/outstanding-dues",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      const { page = 1, limit = 20 } = req.query;

      const numericPage = Math.max(1, parseInt(page as string) || 1);
      const numericLimit = Math.max(1, parseInt(limit as string) || 10);
      const skip = (numericPage - 1) * numericLimit;

      const clientCollection = Client.collection.name;

      const [result] = await Order.aggregate([
        {
          $match: {
            business: businessId,
            paymentStatus: { $in: ["partial", "pending", "borrow"] },
          },
        },
        {
          $group: {
            _id: "$client",
            totalDue: { $sum: { $ifNull: ["$dueAmount", 0] } },
            pendingOrdersCount: { $sum: 1 },
          },
        },
        { $match: { totalDue: { $gt: 0 } } },
        {
          $lookup: {
            from: clientCollection,
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        { $match: { "client.isActive": true, "client.business": businessId } },
        {
          $project: {
            _id: 0,
            clientId: "$client._id",
            clientName: "$client.name",
            shopName: "$client.shopName",
            phone: "$client.phone",
            email: "$client.email",
            address: "$client.address",
            creditLimit: "$client.creditLimit",
            totalDue: 1,
            availableCredit: { $max: [0, { $subtract: ["$client.creditLimit", "$totalDue"] }] },
            pendingOrdersCount: 1,
          },
        },
        { $sort: { totalDue: -1, clientName: 1 } },
        {
          $facet: {
            details: [{ $skip: skip }, { $limit: numericLimit }],
            meta: [{ $count: "totalCount" }],
            summary: [
              {
                $group: {
                  _id: null,
                  totalOutstanding: { $sum: "$totalDue" },
                  clientsWithDue: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      const totalClients = await Client.countDocuments({ business: businessId, isActive: true });
      const totalCount = result?.meta?.[0]?.totalCount || 0;
      const pages = Math.ceil(totalCount / numericLimit);

      return successResponse(res, {
        summary: {
          totalClients,
          clientsWithDue: result?.summary?.[0]?.clientsWithDue || 0,
          totalOutstanding: result?.summary?.[0]?.totalOutstanding || 0,
        },
        details: result?.details || [],
        pagination: {
          page: numericPage,
          limit: numericLimit,
          totalCount,
          hasMore: numericPage < pages,
          pages,
        },
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Collection report (payments) - date range + pagination
router.get(
  "/collections",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      const { startDate, endDate, page = 1, limit = 20 } = req.query;

      if (!startDate || !endDate) {
        return errorResponse(res, "startDate and endDate are required", 400);
      }

      const numericPage = Math.max(1, parseInt(page as string) || 1);
      const numericLimit = Math.max(1, parseInt(limit as string) || 10);
      const skip = (numericPage - 1) * numericLimit;

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      const clientCollection = Client.collection.name;

      const [result] = await Order.aggregate([
        {
          $match: {
            business: businessId,
          }
        },
        { $unwind: "$payments" },
        {
          $match: {
            "payments.recordedAt": { $gte: start, $lte: end },
          },
        },
        {
          $lookup: {
            from: clientCollection,
            localField: "client",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            recordedAt: "$payments.recordedAt",
            method: "$payments.method",
            amount: "$payments.amount",
            notes: "$payments.notes",
            orderNumber: "$orderNumber",
            clientName: "$client.name",
          },
        },
        { $sort: { recordedAt: -1 } },
        {
          $facet: {
            details: [{ $skip: skip }, { $limit: numericLimit }],
            meta: [{ $count: "totalCount" }],
            summary: [
              {
                $group: {
                  _id: null,
                  totalCollected: { $sum: { $ifNull: ["$amount", 0] } },
                  transactions: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      const totalCount = result?.meta?.[0]?.totalCount || 0;
      const pages = Math.ceil(totalCount / numericLimit);

      return successResponse(res, {
        summary: {
          totalCollected: result?.summary?.[0]?.totalCollected || 0,
          transactions: result?.summary?.[0]?.transactions || 0,
        },
        details: result?.details || [],
        pagination: {
          page: numericPage,
          limit: numericLimit,
          totalCount,
          hasMore: numericPage < pages,
          pages,
        },
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Sales person performance report
router.get(
  "/sales-person",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      const orders = await Order.find({ business: businessId }).populate("createdBy", "name email");

      const groupedBySalesPerson: any = {};

      orders.forEach((order) => {
        const salesPersonId = (order.createdBy as any)?._id;
        const salesPersonName = (order.createdBy as any)?.name;

        if (!groupedBySalesPerson[salesPersonId]) {
          groupedBySalesPerson[salesPersonId] = {
            salesPersonName,
            totalOrders: 0,
            totalSales: 0,
            totalCollected: 0,
            totalDue: 0,
          };
        }

        groupedBySalesPerson[salesPersonId].totalOrders++;
        groupedBySalesPerson[salesPersonId].totalSales += order.totalAmount;
        groupedBySalesPerson[salesPersonId].totalCollected += order.paidAmount;
        groupedBySalesPerson[salesPersonId].totalDue += order.dueAmount;
      });

      return successResponse(res, {
        summary: {
          totalSalesPeople: Object.keys(groupedBySalesPerson).length,
          totalOrders: orders.length,
          totalSales: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          totalCollected: orders.reduce((sum, o) => sum + o.paidAmount, 0),
        },
        details: Object.values(groupedBySalesPerson),
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Sales report with year and month filters
router.get(
  "/sales",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      // Default to current month and year
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : null;
      const allMonths = !month; // If month is not provided, get all months for the year

      // Validate month if provided (1-12)
      if (month !== null && (month < 1 || month > 12)) {
        return errorResponse(res, "Month must be between 1 and 12", 400);
      }

      // Get first and last day of the specified month or year
      let startDate: Date;
      let endDate: Date;
      
      if (allMonths) {
        // Get entire year
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      } else {
        // Get specific month
        startDate = new Date(year, month! - 1, 1);
        endDate = new Date(year, month!, 0, 23, 59, 59, 999);
      }

      // Get all orders in the specified period
      const orders = await Order.find({
        business: businessId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate("createdBy", "name").populate("client", "name").lean();

      // Group by sales person
      const groupedBySalesPerson: any = {};

      orders.forEach((order) => {
        const salesPersonId = (order.createdBy as any)?._id;
        const salesPersonName = (order.createdBy as any)?.name;

        if (!groupedBySalesPerson[salesPersonId]) {
          groupedBySalesPerson[salesPersonId] = {
            salesPersonName,
            totalOrders: 0,
            totalSales: 0,
            totalCollected: 0,
            totalDue: 0,
          };
        }

        groupedBySalesPerson[salesPersonId].totalOrders++;
        groupedBySalesPerson[salesPersonId].totalSales += order.totalAmount;
        groupedBySalesPerson[salesPersonId].totalCollected += order.paidAmount;
        groupedBySalesPerson[salesPersonId].totalDue += order.dueAmount;
      });

      // Get top 3 salespeople by sales
      const topSalesPeople = await Order.aggregate([
        {
          $match: {
            business: businessId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$createdBy",
            totalSales: { $sum: { $ifNull: ["$totalAmount", 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalSales: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "salesPerson"
          }
        },
        { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            salesPersonId: "$_id",
            salesPersonName: "$salesPerson.name",
            totalSales: 1,
            _id: 0
          }
        }
      ]) || [];

      // Calculate profit
      const allItemIds = new Set<string>();
      orders.forEach(o => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach(i => allItemIds.add(i.itemId.toString()));
        }
      });

      const itemDocs = await Item.find({ _id: { $in: Array.from(allItemIds) }, business: businessId }).lean();
      const itemCostMap = new Map(itemDocs.map(i => [i._id.toString(), i.costPrice || 0]));

      let totalCostOfGoodsSold = 0;
      for (const order of orders) {
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            const costPrice = itemCostMap.get(item.itemId.toString()) || 0;
            totalCostOfGoodsSold += costPrice * item.quantity;
          }
        }
      }

      const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const totalCollected = orders.reduce((sum, o) => sum + o.paidAmount, 0);
      const totalOutstanding = orders.reduce((sum, o) => sum + o.dueAmount, 0);
      const totalProfit = totalRevenue - totalCostOfGoodsSold;

      return successResponse(res, {
        summary: {
          year,
          month: allMonths ? null : month,
          totalRevenue,
          totalCollected,
          totalOutstanding,
          totalProfit,
          totalOrders: orders.length,
          totalSalesPeople: Object.keys(groupedBySalesPerson).length,
        },
        topSalesPeople,
        details: Object.values(groupedBySalesPerson),
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Expiry report
router.get(
  "/expiry",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      const { status = "all", page = 1, limit = 20 } = req.query;

      const numericPage = Math.max(1, parseInt(page as string) || 1);
      const numericLimit = Math.max(1, parseInt(limit as string) || 10);
      const skip = (numericPage - 1) * numericLimit;

      const now = new Date();
      const expiringWindowDays = 90;
      const expiringBefore = new Date(now.getTime() + expiringWindowDays * 24 * 60 * 60 * 1000);

      const baseQuery: any = { business: businessId };
      if (status === "expired") {
        baseQuery.isExpired = true;
      } else if (status === "expiring_soon") {
        baseQuery.isExpired = false;
        baseQuery.expiryDate = { $lt: expiringBefore };
      } else {
        baseQuery.$or = [
          { isExpired: true },
          { isExpired: false, expiryDate: { $lt: expiringBefore } },
        ];
      }

      const [totalItems, expiredCount, expiringSoonCount, totalCount, details] = await Promise.all([
        Item.countDocuments({ business: businessId }),
        Item.countDocuments({ business: businessId, isExpired: true }),
        Item.countDocuments({ business: businessId, isExpired: false, expiryDate: { $lt: expiringBefore } }),
        Item.countDocuments(baseQuery),
        Item.find(baseQuery)
          .select("sku name stockQuantity expiryDate isExpired")
          .sort({ expiryDate: 1 })
          .skip(skip)
          .limit(numericLimit),
      ]);

      const pages = Math.ceil(totalCount / numericLimit);

      return successResponse(res, {
        summary: {
          expiredCount,
          expiringSoonCount,
          totalItems,
        },
        details,
        pagination: {
          page: numericPage,
          limit: numericLimit,
          totalCount,
          hasMore: numericPage < pages,
          pages,
        },
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Stock report
router.get(
  "/stock",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      const { filter = "all", page = 1, limit = 20 } = req.query;

      const numericPage = Math.max(1, parseInt(page as string) || 1);
      const numericLimit = Math.max(1, parseInt(limit as string) || 10);
      const skip = (numericPage - 1) * numericLimit;

      const query: any = { business: businessId };
      if (filter === "low_stock") {
        query.$expr = {
          $and: [
            { $gt: ["$stockQuantity", 0] },
            { $lte: ["$stockQuantity", "$lowStockThreshold"] },
          ],
        };
      } else if (filter === "out_of_stock") {
        query.stockQuantity = 0;
      }

      const [summaryAgg] = await Item.aggregate([
        { $match: { business: businessId } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalValue: {
              $sum: {
                $multiply: [{ $ifNull: ["$stockQuantity", 0] }, { $ifNull: ["$sellingPrice", 0] }],
              },
            },
            lowStockCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$stockQuantity", 0] },
                      { $lte: ["$stockQuantity", "$lowStockThreshold"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            outOfStockCount: {
              $sum: {
                $cond: [{ $eq: ["$stockQuantity", 0] }, 1, 0],
              },
            },
          },
        },
      ]);

      const totalCount = await Item.countDocuments(query);
      const pages = Math.ceil(totalCount / numericLimit);

      const details = await Item.find(query)
        .populate("category", "name")
        .select("sku name category stockQuantity lowStockThreshold sellingPrice costPrice")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit);

      return successResponse(res, {
        summary: {
          totalItems: summaryAgg?.totalItems || 0,
          lowStockCount: summaryAgg?.lowStockCount || 0,
          outOfStockCount: summaryAgg?.outOfStockCount || 0,
          totalValue: summaryAgg?.totalValue || 0,
        },
        details,
        pagination: {
          page: numericPage,
          limit: numericLimit,
          totalCount,
          hasMore: numericPage < pages,
          pages,
        },
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Aggregated reports - single endpoint for frontend
router.get(
  "/all",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      // ===== OPTIMIZED: Separate queries for order counts =====
      const [
        totalOrders,
        completedOrders,
        pendingOrders,
        backorderOrders,
        orderStats
      ] = await Promise.all([
        Order.countDocuments({ business: businessId }),
        Order.countDocuments({ business: businessId, orderStatus: "completed" }),
        Order.countDocuments({
          business: businessId,
          orderStatus: { $ne: "completed" }
        }),
        Order.countDocuments({ business: businessId, orderStatus: "backorder" }),
        // Get aggregated revenue and payment data
        Order.aggregate([
          { $match: { business: businessId } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
              totalCollected: { $sum: { $ifNull: ["$paidAmount", 0] } },
              totalOutstanding: { $sum: { $ifNull: ["$dueAmount", 0] } },
              totalCount: { $sum: 1 }
            }
          }
        ])
      ]);

      const totalRevenue = orderStats[0]?.totalRevenue || 0;
      const totalCollected = orderStats[0]?.totalCollected || 0;
      const totalOutstanding = orderStats[0]?.totalOutstanding || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // ===== Get orders with necessary fields for sales & client data =====
      const orders = await Order.find({ business: businessId })
        .populate("client", "name")
        .populate("createdBy", "name")
        .select("client createdBy totalAmount items dueAmount paymentStatus")
        .lean();

      // Sales summary
      const sales: any = {
        summary: {
          totalRevenue: totalRevenue,
          totalCollected: totalCollected,
          totalOutstanding: totalOutstanding,
        },
      };

      // Get top 3 salespeople by sales using aggregation
      const topSalesPeople = await Order.aggregate([
        { $match: { business: businessId } },
        {
          $group: {
            _id: "$createdBy",
            totalSales: { $sum: { $ifNull: ["$totalAmount", 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalSales: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "salesPerson"
          }
        },
        { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            salesPersonId: "$_id",
            salesPersonName: "$salesPerson.name",
            totalSales: 1,
            _id: 0
          }
        }
      ]) || [];

      // Optimization: Get items involved in these orders to calculate profit
      const allItemIds = new Set<string>();
      orders.forEach(o => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach(i => allItemIds.add(i.itemId.toString()));
        }
      });
      
      const itemDocs = await Item.find({ _id: { $in: Array.from(allItemIds) }, business: businessId }).lean();
      const itemCostMap = new Map(itemDocs.map(i => [i._id.toString(), i.costPrice || 0]));

      let totalCostOfGoodsSold = 0;
      for (const order of orders) {
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            const costPrice = itemCostMap.get(item.itemId.toString()) || 0;
            totalCostOfGoodsSold += costPrice * item.quantity;
          }
        }
      }

      const totalProfit = totalRevenue - totalCostOfGoodsSold;

      sales.topSalesPeople = topSalesPeople;
      sales.totalPurchaseValue = totalCostOfGoodsSold;
      sales.totalProfit = totalProfit;

      // ===== Collection data using separate query =====
      const [collectionStats] = await Order.aggregate([
        { $match: { business: businessId, paymentStatus: "fully_paid" } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalCollected: { $sum: { $ifNull: ["$totalAmount", 0] } }
          }
        }
      ]);

      const collection = {
        summary: {
          totalOrders: collectionStats?.totalOrders || 0,
          totalCollected: collectionStats?.totalCollected || 0,
          averageOrderValue: collectionStats && collectionStats.totalOrders > 0
            ? collectionStats.totalCollected / collectionStats.totalOrders
            : 0,
        },
      };

      // ===== Stock and expiry using separate queries =====
      const [
        items,
        stockStats
      ] = await Promise.all([
        Item.find({ business: businessId }).lean(),
        Item.aggregate([
          { $match: { business: businessId } },
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              lowStockCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ["$stockQuantity", 0] },
                        { $lte: ["$stockQuantity", "$lowStockThreshold"] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              outOfStockCount: {
                $sum: {
                  $cond: [{ $eq: ["$stockQuantity", 0] }, 1, 0]
                }
              },
              totalValue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ["$stockQuantity", 0] },
                    { $ifNull: ["$sellingPrice", 0] }
                  ]
                }
              }
            }
          }
        ])
      ]);

      const stock = {
        summary: {
          totalItems: stockStats[0]?.totalItems || 0,
          lowStockCount: stockStats[0]?.lowStockCount || 0,
          outOfStockCount: stockStats[0]?.outOfStockCount || 0,
          totalValue: stockStats[0]?.totalValue || 0,
        },
      };

      // ===== Expiry using separate query =====
      const expiryStats = await Item.aggregate([
        { $match: { business: businessId } },
        {
          $group: {
            _id: null,
            expiredCount: {
              $sum: { 
                $cond: [
                  {
                    $or: [
                      { $eq: ["$isExpired", true] },
                      { $lt: [{ $toDate: "$expiryDate" }, new Date()] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            expiringSoonCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$isExpired", false] },
                      {
                        $lt: [
                          { $subtract: [{ $toDate: "$expiryDate" }, new Date()] },
                          30 * 24 * 60 * 60 * 1000
                        ]
                      }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const expiry = {
        summary: {
          expiredCount: expiryStats[0]?.expiredCount || 0,
          expiringSoonCount: expiryStats[0]?.expiringSoonCount || 0,
        },
      };

      // ===== Outstanding dues using separate query =====
      const clients = await Client.find({ business: businessId, isActive: true }).lean();
      
      const duesAgg = await Order.aggregate([
        {
          $match: {
            business: businessId,
            paymentStatus: { $in: ["pending", "partial", "borrow"] }
          }
        },
        {
          $group: {
            _id: "$client",
            totalDue: { $sum: { $ifNull: ["$dueAmount", 0] } },
            count: { $sum: 1 }
          }
        }
      ]);

      const dues = clients.map((client) => {
        const clientDueData = duesAgg.find((d: any) => d._id.toString() === client._id.toString());
        
        return {
          clientId: client._id,
          clientName: client.name,
          phone: client.phone,
          email: client.email,
          address: client.address,
          totalDue: clientDueData?.totalDue || 0,
          creditLimit: client.creditLimit,
          availableCredit: Math.max(0, (client.creditLimit || 0) - (clientDueData?.totalDue || 0)),
          pendingOrdersCount: clientDueData?.count || 0,
        };
      });

      // Get top 3 clients by total purchase using aggregation
      const topClients = await Order.aggregate([
        { $match: { business: businessId } },
        {
          $group: {
            _id: "$client",
            totalPurchase: { $sum: { $ifNull: ["$totalAmount", 0] } }
          }
        },
        { $sort: { totalPurchase: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client"
          }
        },
        { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            clientId: "$_id",
            clientName: "$client.name",
            shopName: { $ifNull: ["$client.shopName", "$client.name"] },
            totalPurchase: 1,
            _id: 0
          }
        }
      ]) || [];

      const debt = {
        summary: {
          totalClients: clients.length,
          clientsWithDue: dues.filter((d) => d.totalDue > 0).length,
          totalOutstanding: dues.reduce((s, d) => s + d.totalDue, 0),
        },
        topClients: topClients,
      };

      // ===== Get unique sales persons count =====
      const [uniqueSalesPersons] = await Order.aggregate([
        { $match: { business: businessId } },
        {
          $group: {
            _id: "$createdBy"
          }
        },
        {
          $count: "count"
        }
      ]);

      const overview = {
        totalOrders,
        completedOrders,
        pendingOrders,
        backorderOrders,
        totalRevenue,
        totalCollected,
        totalOutstanding,
        averageOrderValue,
        totalClients: clients.length,
        totalSalesPersons: uniqueSalesPersons?.count || 0,
      };

      return successResponse(res, {
        overview,
        sales,
        collection,
        stock,
        expiry,
        debt,
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

// Revenue report
router.get(
  "/revenue",
  requireRole(["owner"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.business) return errorResponse(res, "Business not found", 400);
      const businessId = req.user.business;

      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const monthQuery = req.query.month as string;
      const isAll = monthQuery === "ALL";

      let startDate: Date;
      let endDate: Date;

      if (isAll) {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 12, 0, 23, 59, 59, 999);
      } else {
        const monthNum = parseInt(monthQuery);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          return errorResponse(res, "Month must be between 1 and 12", 400);
        }
        startDate = new Date(year, monthNum - 1, 1);
        endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
      }

      const business = await Business.findById(businessId).select("createdAt");
      const joinYear = business?.createdAt ? new Date(business.createdAt).getFullYear() : now.getFullYear();

      const orders = await Order.find({
        business: businessId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).select("totalAmount paidAmount dueAmount createdAt items").lean();

      const allItemIds = new Set<string>();
      orders.forEach((o) => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach((i) => {
            if (i.itemId) {
              allItemIds.add(i.itemId.toString());
            }
          });
        }
      });

      const itemDocs = await Item.find({ _id: { $in: Array.from(allItemIds) }, business: businessId }).select("costPrice").lean();
      const itemCostMap = new Map(itemDocs.map((i) => [i._id.toString(), i.costPrice || 0]));

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalRevenue: 0,
        totalCollected: 0,
        totalDue: 0,
        totalOrders: 0,
        totalProfit: 0
      }));

      let totalRevenueForYear = 0;
      let totalCollectedForYear = 0;
      let totalDueForYear = 0;
      let totalOrdersForYear = 0;
      let totalProfitForYear = 0;

      orders.forEach((o) => {
        const orderDate = new Date(o.createdAt);
        const mIdx = orderDate.getMonth();

        let orderCost = 0;
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach((item) => {
            if (item.itemId) {
              const costPrice = itemCostMap.get(item.itemId.toString()) || 0;
              orderCost += costPrice * item.quantity;
            }
          });
        }
        const orderRevenue = o.totalAmount || 0;
        const orderProfit = orderRevenue - orderCost;

        if (mIdx >= 0 && mIdx < 12) {
          monthlyData[mIdx] = {
            month: mIdx + 1,
            totalRevenue: monthlyData[mIdx].totalRevenue + orderRevenue,
            totalCollected: monthlyData[mIdx].totalCollected + (o.paidAmount || 0),
            totalDue: monthlyData[mIdx].totalDue + (o.dueAmount || 0),
            totalOrders: monthlyData[mIdx].totalOrders + 1,
            totalProfit: monthlyData[mIdx].totalProfit + orderProfit
          };
        }
        totalRevenueForYear += orderRevenue;
        totalCollectedForYear += o.paidAmount || 0;
        totalDueForYear += o.dueAmount || 0;
        totalOrdersForYear += 1;
        totalProfitForYear += orderProfit;
      });

      return successResponse(res, {
        summary: {
          year,
          totalRevenueForYear,
          totalCollectedForYear,
          totalDueForYear,
          totalOrdersForYear,
          totalProfitForYear,
          joinYear
        },
        monthly: monthlyData
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

export default router;
