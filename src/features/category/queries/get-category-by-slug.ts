// src/features/category/queries/get-category-by-slug.ts
import "server-only";
import { dbConnect } from "@/lib/db/dbConnect";
import { Category } from "@/models/Category";
import type { CategoryDTO } from "../types";

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
  await dbConnect();

  const c = await Category.findOne({ slug }).lean();
  if (!c) return null;

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