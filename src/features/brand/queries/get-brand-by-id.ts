import "server-only";
import { unstable_cache } from "next/cache";

import { dbConnect } from "@/lib/db/dbConnect";
import { Brand } from "@/models/Brand";

import type { IBrand } from "../types";

const getCachedBrandById = unstable_cache(
  async (id: string): Promise<IBrand | null> => {
    await dbConnect();

    const brand = await Brand.findById(id).lean();
    if (!brand) return null;

    return {
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
    };
  },
  ["brand-by-id"],
  { tags: ["brands"] },
);

export async function getBrandById(id: string): Promise<IBrand | null> {
  return getCachedBrandById(id);
}