import { Schema, model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "owner" | "sales_person";
  business?: Schema.Types.ObjectId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: "none" | "active" | "inactive" | "suspended" | "trial";
  subscriptionPlan?: "basic" | "pro";
  subscriptionEndDate?: Date;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedClients?: any[]; // Virtual field populated from Client model
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "sales_person"],
      default: "sales_person",
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: false,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "inactive", "suspended", "trial"],
      default: "none",
    },
    subscriptionPlan: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      default: null,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual populate to get assigned clients
userSchema.virtual("assignedClients", {
  ref: "Client",
  localField: "_id",
  foreignField: "salesPerson",
});

// Ensure virtuals are included when converting to JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Compound unique index for email within a business (only for sales_person)
userSchema.index({ business: 1, email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export default model<IUser>("User", userSchema);
