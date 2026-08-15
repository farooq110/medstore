import { Schema, model } from "mongoose";

interface IItem {
  business: Schema.Types.ObjectId;
  name: string;
  category: Schema.Types.ObjectId;
  stockQuantity: number;
  lowStockThreshold: number;
  expiryDate: Date;
  sellingPrice: number;
  costPrice?: number;
  isExpired: boolean;
  sku?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const itemSchema = new Schema<IItem>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    sku: {
      type: String,
      sparse: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indices for multi-tenant queries
itemSchema.index({ business: 1, category: 1 });
itemSchema.index({ business: 1, expiryDate: 1 });
itemSchema.index({ business: 1, isExpired: 1 });
// Compound unique index for SKU within business
itemSchema.index({ business: 1, sku: 1 }, { unique: true, sparse: true });

export default model<IItem>("Item", itemSchema);
