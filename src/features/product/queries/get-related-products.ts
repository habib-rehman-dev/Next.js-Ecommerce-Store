import "server-only";
import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import "@/models/Category";
import "@/models/Brand";
import type { IProduct } from "../types";

const getCachedRelatedProducts = unstable_cache(
  async (categoryId: string, excludeProductId: string, limit: number): Promise<IProduct[]> => {
    await dbConnect();

    const products = await Product.find({
      categoryId,
      status: "active",
      _id: { $ne: excludeProductId },
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(products));
  },
  ["related-products"],
  { tags: ["products"] },
);

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<IProduct[]> {
  return getCachedRelatedProducts(categoryId, excludeProductId, limit);
}