import { Schema, model } from "mongoose";

interface ICategory {
  business: Schema.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
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
    description: {
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

// Compound unique index for category name within business
categorySchema.index({ business: 1, name: 1 }, { unique: true });
categorySchema.index({ business: 1, isActive: 1 });

// Virtual relation to items
categorySchema.virtual('items', {
  ref: 'items',
  localField: '_id',
  foreignField: 'category',
  justOne: false,
});

// Ensure virtuals are included when converting to JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

export default model<ICategory>("categories", categorySchema);
