import "server-only";
import { dbConnect } from "@/lib/db/dbConnect";
import { Category } from "@/models/Category";
import type { CategoryDTO } from "../types";

export async function getCategories(): Promise<CategoryDTO[]> {
  await dbConnect();

  const categories = await Category.find()
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return categories.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    parentCategoryId: c.parentCategoryId ? c.parentCategoryId.toString() : null,
    status: c.status,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}