import { Schema, model } from "mongoose";

interface IAlert {
  business: Schema.Types.ObjectId;
  type: "low_stock" | "out_of_stock" | "expiring_soon" | "expired" | "backorder_pending";
  itemId?: Schema.Types.ObjectId;
  orderId?: Schema.Types.ObjectId;
  message: string;
  severity: "warning" | "urgent";
  seenByOwner: boolean;
  seenBySalesPerson: boolean;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    type: {
      type: String,
      enum: ["low_stock", "out_of_stock", "expiring_soon", "expired", "backorder_pending"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["warning", "urgent"],
      default: "warning",
    },
    seenByOwner: {
      type: Boolean,
      default: false,
    },
    seenBySalesPerson: {
      type: Boolean,
      default: false,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indices for multi-tenant queries
alertSchema.index({ business: 1, resolved: 1 });
alertSchema.index({ business: 1, type: 1 });
alertSchema.index({ business: 1, severity: 1 });
alertSchema.index({ business: 1, itemId: 1 });
alertSchema.index({ business: 1, orderId: 1 });

export default model<IAlert>("Alert", alertSchema);
