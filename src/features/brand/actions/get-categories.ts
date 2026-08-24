import "server-only";
import { dbConnect } from "@/lib/db/dbConnect";
import { Brand } from "@/models/Brand";
import type { IBrand  } from "../types";

export async function getBrands(): Promise<IBrand[]> {
  await dbConnect();

  const brands = await Brand.find()
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return brands.map((c) => ({
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