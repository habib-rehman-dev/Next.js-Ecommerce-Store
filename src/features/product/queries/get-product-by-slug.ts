import "server-only";
import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import "@/models/Category";
import "@/models/Brand";
import type { IProduct } from "../types";

const getCachedProductBySlug = unstable_cache(
  async (slug: string): Promise<IProduct | null> => {
    await dbConnect();

    const product = await Product.findOne({ slug, status: "active" })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .lean();

    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  },
  ["product-by-slug"],
  { tags: ["products"] },
);

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  return getCachedProductBySlug(slug);
}