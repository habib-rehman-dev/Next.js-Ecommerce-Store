// src/features/product/queries/get-featured-products.ts
import "server-only";
import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import "@/models/Category";
import "@/models/Brand";
import type { IProduct } from "../types";

type GetFeaturedProductsOptions = {
  limit?: number;
  type?: "featured" | "bestSelling" | "newArrivals";
};

const getCachedFeaturedProducts = unstable_cache(
  async (options: GetFeaturedProductsOptions = {}): Promise<IProduct[]> => {
    const { limit = 8, type = "featured" } = options;
    await dbConnect();

    let query: Record<string, unknown> = { status: "active" };
    let sort: Record<string, 1 | -1> = { createdAt: -1 };

    switch (type) {
      case "featured":
        query = { ...query, isFeatured: true };
        sort = { sortOrder: 1, createdAt: -1 };
        break;
      case "bestSelling":
        // Note: You'll need a sales tracking system for this
        // For now, we'll use a placeholder sort
        sort = { "variants.price": 1, createdAt: -1 };
        break;
      case "newArrivals":
        query = { ...query };
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .sort(sort)
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(products));
  },
  ["featured-products"],
  { 
    tags: ["products", "featured-products"],
    revalidate: 3600 // Revalidate every hour
  }
);

export async function getFeaturedProducts(
  options?: GetFeaturedProductsOptions
): Promise<IProduct[]> {
  return getCachedFeaturedProducts(options);
}