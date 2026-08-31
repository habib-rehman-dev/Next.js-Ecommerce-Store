// src/features/product/queries/get-product-by-id.ts
import "server-only";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import "@/models/Category";
import "@/models/Brand";
import type { IProduct } from "../types";

/**
 * Single-product lookup by id, populated with category/brand for admin
 * edit forms. Intentionally NOT cached with unstable_cache — this is used
 * on the admin edit page where the person expects to see the latest write
 * immediately after a save, and admin edit traffic is low-volume enough
 * that caching isn't worth the staleness risk (unlike get-product-by-slug,
 * which is the public storefront read path).
 */
export async function getProductById(id: string): Promise<IProduct | null> {
  await dbConnect();

  const product = await Product.findById(id)
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug")
    .lean();

  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}