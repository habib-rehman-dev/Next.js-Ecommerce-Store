// src/models/HeroBanner.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IHeroBanner extends Document {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  badgeText?: string;
  couponCode?: string;
  imageUrl: string;
  status: "active" | "draft";
  priority: number;
}

const HeroBannerSchema = new Schema<IHeroBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    ctaText: { type: String, required: true, default: "Shop Now" },
    ctaLink: { type: String, required: true },
    badgeText: { type: String },
    couponCode: { type: String },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ["active", "draft"], default: "active" },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const HeroBanner =
  mongoose.models.HeroBanner ||
  mongoose.model<IHeroBanner>("HeroBanner", HeroBannerSchema);