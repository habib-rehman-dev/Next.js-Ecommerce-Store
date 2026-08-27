import "server-only";
import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Category } from "@/models/Category";
import type { CategoryDTO } from "../types";

function toDTO(c: {
  _id: { toString(): string };
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategoryId: { toString(): string } | null;
  status: "active" | "inactive";
  isFeatured?: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): CategoryDTO {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    parentCategoryId: c.parentCategoryId ? c.parentCategoryId.toString() : null,
    status: c.status,
    isFeatured: c.isFeatured ?? false,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

const getCachedFeaturedCategories = unstable_cache(
  async (limit: number): Promise<CategoryDTO[]> => {
    await dbConnect();

    const featured = await Category.find({ isFeatured: true, status: "active" })
      .sort({ sortOrder: 1, name: 1 })
      .limit(limit)
      .lean();

    if (featured.length > 0) {
      return featured.map(toDTO);
    }

    const fallback = await Category.find({ status: "active" })
      .sort({ sortOrder: 1, name: 1 })
      .limit(limit)
      .lean();

    return fallback.map(toDTO);
  },
  ["featured-categories"],
  { tags: ["categories"] },
);

/**
 * Categories for the storefront homepage grid. Cached and revalidated
 * via the "categories" tag whenever a category is created/updated/deleted.
 */
export async function getFeaturedCategories(limit = 8): Promise<CategoryDTO[]> {
  return getCachedFeaturedCategories(limit);
}