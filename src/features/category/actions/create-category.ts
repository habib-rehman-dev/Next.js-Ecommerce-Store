"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { slugify } from "@/lib/slugify";
import { Category } from "@/models/Category";
import type { ActionResult } from "@/lib/action-result";
import { createCategorySchema } from "../validation";

export async function createCategory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  await dbConnect();

  const slug = data.slug ? data.slug : slugify(data.name);

  const slugTaken = await Category.exists({ slug });
  if (slugTaken) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: { slug: ["A category with this slug already exists"] },
    };
  }

  if (data.parentCategoryId) {
    const parentExists = await Category.exists({ _id: data.parentCategoryId });
    if (!parentExists) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { parentCategoryId: ["Parent category not found"] },
      };
    }
  }

  const category = await Category.create({
    name: data.name,
    slug,
    description: data.description || undefined,
    image: data.image || undefined,
    parentCategoryId: data.parentCategoryId || null,
    status: data.status,
    sortOrder: data.sortOrder,
  });

  revalidatePath("/admin/categories");

  return { success: true, data: { id: category._id.toString() } };
}