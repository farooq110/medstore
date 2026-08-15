import { Schema, model } from "mongoose";

interface IAccountDeletionRequest {
  email: string;
  phoneNumber: string;
  status: "pending" | "verified" | "processing" | "completed" | "cancelled";
  verificationToken?: string;
  verificationExpires?: Date;
  verifiedAt?: Date;
  processedAt?: Date;
  reason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountDeletionRequestSchema = new Schema<IAccountDeletionRequest>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "processing", "completed", "cancelled"],
      default: "pending",
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationExpires: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
accountDeletionRequestSchema.index({ email: 1, phoneNumber: 1 });
accountDeletionRequestSchema.index({ status: 1 });
accountDeletionRequestSchema.index({ createdAt: -1 });
accountDeletionRequestSchema.index({ verificationToken: 1 });

export default model("AccountDeletionRequest", accountDeletionRequestSchema);
