import { Schema, model } from "mongoose";

interface IOrderItem {
  itemId: Schema.Types.ObjectId;
  itemName: string;
  quantity: number;
  sellingPrice: number;
  subtotal: number;
  expiryDate: Date;
  isBackorder: boolean;
}

interface IPayment {
  amount: number;
  method: "cash" | "card" | "check" | "bank_transfer";
  recordedBy: Schema.Types.ObjectId;
  recordedAt: Date;
  notes?: string;
}

interface IOrder {
  business: Schema.Types.ObjectId;
  orderNumber: string;
  orderType: "delivery" | "pos";
  client: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  assignedTo?: Schema.Types.ObjectId; // Sales person this order is assigned to
  assignedAt?: Date;
  assignedFor?: "delivery" | "payment_collection"; // What task is assigned
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "pending" | "partial" | "fully_paid" | "borrow";
  orderStatus: "created" | "assigned" | "completed" | "backorder";
  payments: IPayment[];
  isBackorderComplete?: boolean;
  isDelivered?: boolean;
  deliveredAt?: Date;
  dueCollected?: boolean;
  dueCollectedAt?: Date;
  notes?: string;
  shareToken?: string; // Secure token for public access
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  itemName: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  expiryDate: Date,
  isBackorder: {
    type: Boolean,
    default: false,
  },
});

const paymentSchema = new Schema<IPayment>({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    enum: ["cash", "card", "check", "bank_transfer"],
    default: "cash",
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
  notes: String,
});

const orderSchema = new Schema<IOrder>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["delivery", "pos"],
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: Date,
    assignedFor: {
      type: String,
      enum: ["delivery", "payment_collection"],
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "fully_paid", "borrow"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["created", "assigned", "completed", "backorder"],
      default: "created",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    dueCollected: {
      type: Boolean,
      default: false,
    },
    dueCollectedAt: Date,
    payments: [paymentSchema],
    isBackorderComplete: {
      type: Boolean,
      default: false,
    },
    notes: String,
    shareToken: {
      type: String,
      default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    },
  },
  { timestamps: true }
);

// Compound unique index for orderNumber within business
orderSchema.index({ business: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ business: 1, client: 1 });
orderSchema.index({ business: 1, createdBy: 1 });
orderSchema.index({ business: 1, assignedTo: 1 });
orderSchema.index({ business: 1, orderStatus: 1 });
orderSchema.index({ business: 1, paymentStatus: 1 });

export default model<IOrder>("Order", orderSchema);
