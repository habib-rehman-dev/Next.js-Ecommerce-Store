import { Schema, model, models, Types } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  parentCategoryId: Types.ObjectId | null;
  status: "active" | "inactive";
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    imagePublicId: { type: String, default: "" },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    sortOrder: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// Used when finding active children of a category
categorySchema.index({ parentCategoryId: 1, status: 1 });

export const Category = models.Category || model<ICategory>("Category", categorySchema);