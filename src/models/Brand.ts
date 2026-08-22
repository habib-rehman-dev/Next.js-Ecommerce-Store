import { Schema, model, models } from "mongoose";

export interface IBrand {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoPublicId?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    logoPublicId: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// Used on the storefront: "show only active brands, alphabetically"
brandSchema.index({ status: 1, name: 1 });

export const Brand = models.Brand || model<IBrand>("Brand", brandSchema);