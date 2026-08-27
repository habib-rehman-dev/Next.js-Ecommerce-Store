// src/features/brand/queries/get-active-brands.ts
import "server-only";
import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Brand } from "@/models/Brand";
import type { BrandDTO } from "../types";

const getCachedActiveBrands = unstable_cache(
  async (limit: number = 12): Promise<BrandDTO[]> => {
    await dbConnect();

    const brands = await Brand.find({ status: "active" })
      .sort({ sortOrder: 1, name: 1 })
      .limit(limit)
      .lean();

    return brands.map((brand) => ({
      id: brand._id.toString(),
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
      logoPublicId: brand.logoPublicId,
      status: brand.status,
      sortOrder: brand.sortOrder ?? 0,
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    }));
  },
  ["active-brands"],
  { tags: ["brands"], revalidate: 3600 } // Revalidate every hour
);

export async function getActiveBrands(limit: number = 12): Promise<BrandDTO[]> {
  return getCachedActiveBrands(limit);
}