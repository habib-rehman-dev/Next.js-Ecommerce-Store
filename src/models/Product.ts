import { Schema, model, models, Types } from "mongoose";

export interface IProductVariant {
  sku: string;
  attributes: Record<string, string>; // e.g. { color: "Red", size: "M" }
  price: number;
  discountPrice?: number;
  stock: number;
  images?: string[];
}

export interface IProduct {
  name: string;
  slug: string;
  description?: string;
  categoryId: Types.ObjectId;
  brandId: Types.ObjectId;
  images: string[];
  imagePublicIds?: string[];
  variants: IProductVariant[];
  status: "active" | "inactive";
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true, trim: true, uppercase: true },
    attributes: { type: Map, of: String, default: {} },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    images: { type: [String], default: [] },
    imagePublicIds: { type: [String], default: [] },
    variants: {
      type: [productVariantSchema],
      validate: {
        validator: (variants: IProductVariant[]) => variants.length > 0,
        message: "A product must have at least one variant",
      },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ brandId: 1, status: 1 });
productSchema.index({ "variants.sku": 1 }, { unique: true });
// Used by the homepage: "show active, featured products, newest first"
productSchema.index({ isFeatured: 1, status: 1, createdAt: -1 });

export const Product = models.Product || model<IProduct>("Product", productSchema);