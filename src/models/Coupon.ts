import { Schema, model, models } from "mongoose";

export interface ICoupon {
  code: string;
  discountType: "percentage" 
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, min: 0 },
    maxUses: { type: Number, min: 1 },
    // How many times this coupon has actually been applied so far.
    // Order actions increment this when a coupon is used.
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export const Coupon = models.Coupon || model<ICoupon>("Coupon", couponSchema);