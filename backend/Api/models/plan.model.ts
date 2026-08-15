import { Schema, model } from "mongoose";

interface IPlan {
  name: string;
  stripePriceId: string;
  country: string;
  tier: "Basic" | "Pro";
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stripePriceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      enum: ["US", "PK"], // Expand this as needed
      trim: true,
    },
    tier: {
      type: String,
      enum: ["Basic", "Pro"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model<IPlan>("Plan", planSchema);
