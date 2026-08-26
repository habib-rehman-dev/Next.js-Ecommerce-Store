import "server-only";
import { unstable_cache } from "next/cache";

import { dbConnect } from "@/lib/db/dbConnect";
import { Brand } from "@/models/Brand";

import type { BrandDTO } from "../types";

const getCachedBrands = unstable_cache(
  async (): Promise<BrandDTO[]> => {
    await dbConnect();

    const brands = await Brand.find().sort({ sortOrder: 1, name: 1 }).lean();

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
  ["brands"],
  { tags: ["brands"] },
);

export async function getBrands(): Promise<BrandDTO[]> {
  return getCachedBrands();
}
