import "server-only";
import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { HeroBanner } from "@/models/HeroBanner";

const getCachedActiveHeroBanners = unstable_cache(
  async () => {
    await dbConnect();
    const banners = await HeroBanner.find({ status: "active" })
      .sort({ priority: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(banners));
  },
  ["active-hero-banners"],
  { tags: ["hero-banners"] },
);

export async function getActiveHeroBanners() {
  return getCachedActiveHeroBanners();
}