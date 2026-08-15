import { Router, Request, Response } from "express";
import CategoryModel from "../../models/category.model";
import ItemModel from "../../models/item.model";
import { AuthRequest } from "../../Interface/auth.interface";
import { requireRole } from "../../Helper/auth.helper";
import { Types } from "mongoose";

const router = Router();

// GET all categories
router.get("/", requireRole(["owner", "sales_person"]), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return res.status(400).json({
        success: false,
        message: "Business not found",
      });
    }

    const { page = 1, limit = 20, search, status } = req.query;

    // Parse pagination parameters
    const numericPage = Math.max(1, parseInt(page as string) || 1);
    const numericLimit = Math.max(1, parseInt(limit as string) || 10);
    const skip = (numericPage - 1) * numericLimit;

    // Build match query
    let matchQuery: any = { business: req.user.business };

    // For sales_person: always show only active categories (default behavior)
    // For owner: show all categories by default, but allow filtering
    if (req.user.role === "sales_person") {
      matchQuery.isActive = true;
    } else if (status === "active") {
      matchQuery.isActive = true;
    } else if (status === "inactive") {
      matchQuery.isActive = false;
    } else if (status === "all") {
      // Show all, including inactive
    } else {
      // Default for owner: show all categories (both active and inactive)
    }
    
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        // { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Call count and categories in parallel
    const [total, categories] = await Promise.all([
      CategoryModel.countDocuments(matchQuery),
      CategoryModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "items",
            let: { categoryId: "$_id" },
            pipeline: [
              { 
                $match: { 
                  $expr: { $eq: ["$category", "$$categoryId"] },
                  isActive: true
                } 
              }
            ],
            as: "products",
          },
        },
        {
          $addFields: {
            productCount: { $size: "$products" },
          },
        },
        {
          $project: {
            products: 0, // Exclude the full products array
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: numericLimit,
        },
      ]),
    ]);

    const pages = Math.ceil(total / numericLimit);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        totalCount: total,
        hasMore: numericPage < pages,
        pages,
      },
      msg: "Categories retrieved successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching categories",
    });
  }
});

// GET single category by ID
router.get("/:id", requireRole(["owner", "sales_person"]), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return res.status(400).json({
        success: false,
        message: "Business not found",
      });
    }

    const category = await CategoryModel.findOne({ _id: req.params.id, business: req.user.business });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching category",
    });
  }
});

// CREATE category
router.post("/", requireRole(["owner"]), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return res.status(400).json({
        success: false,
        message: "Business not found",
      });
    }

    const { name, description } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category already exists for this business
    const existingCategory = await CategoryModel.findOne({
      name: name.trim(),
      business: req.user.business,
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const newCategory = new CategoryModel({
      name: name.trim(),
      description: description?.trim() || "",
      isActive: true,
      business: req.user.business,
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      data: newCategory,
      message: "Category created successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating category",
    });
  }
});

// UPDATE category
router.put("/:id", requireRole(["owner"]), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return res.status(400).json({
        success: false,
        message: "Business not found",
      });
    }

    const { name, description, isActive } = req.body;

    const category = await CategoryModel.findOne({ _id: req.params.id, business: req.user.business });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new name already exists (if name is being updated)
    if (name && name !== category.name) {
      const existingCategory = await CategoryModel.findOne({
        name: name.trim(),
        business: req.user.business,
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    category.name = name?.trim() || category.name;
    category.description = description?.trim() || category.description;
    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating category",
    });
  }
});

// DELETE category (soft delete if has products, hard delete if no products)
router.delete("/:id", requireRole(["owner"]), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.business) {
      return res.status(400).json({
        success: false,
        message: "Business not found",
      });
    }

    const category = await CategoryModel.findOne({ _id: req.params.id, business: req.user.business });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has products
    const product = await ItemModel.findOne({ category: req.params.id, business: req.user.business, isActive: true });

    if (product) {
      // Soft delete: set isActive to false
      category.isActive = false;
      await category.save();

      res.status(200).json({
        success: true,
        data: category,
        message: `Category soft deleted successfully. It has products associated with it, so it cannot be hard deleted.`,
      });
    } else {
      // Hard delete: remove from database
      await CategoryModel.findOneAndDelete({ _id: req.params.id, business: req.user.business });

      res.status(200).json({
        success: true,
        data: null,
        message: "Category hard deleted successfully",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting category",
    });
  }
});

export default router;
