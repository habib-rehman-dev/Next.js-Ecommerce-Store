// src/features/hero/queries/get-hero-banners.ts
import { dbConnect } from "@/lib/db/dbConnect";
import { HeroBanner } from "@/models/HeroBanner";

export async function getActiveHeroBanners() {
  await dbConnect();
  const banners = await HeroBanner.find({ status: "active" })
    .sort({ priority: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(banners));
}