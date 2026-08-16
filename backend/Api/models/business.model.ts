import { Schema, model } from "mongoose";

interface IBusiness {
  name: string;
  owner: Schema.Types.ObjectId;
  country: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  ntn?: string;
  businessLicense?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      trim: true,
    },
    ntn: {
      type: String,
      trim: true,
      default: null,
    },
    businessLicense: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for business owner lookups
businessSchema.index({ owner: 1 });

export default model<IBusiness>("Business", businessSchema);
