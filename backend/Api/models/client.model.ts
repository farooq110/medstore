import { Schema, model } from "mongoose";

interface IClient {
  business: Schema.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address: string;
  shopName?: string;
  salesPerson?: Schema.Types.ObjectId;
  totalDue: number;
  creditLimit: number;
  isActive: boolean;
  ntn?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
    },
    shopName: {
      type: String,
      trim: true,
    },
    salesPerson: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    totalDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditLimit: {
      type: Number,
      default: 50000,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ntn: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Indices for multi-tenant queries
clientSchema.index({ business: 1, isActive: 1 });
clientSchema.index({ business: 1, name: 1 });
clientSchema.index({ salesPerson: 1 });

export default model<IClient>("Client", clientSchema);
