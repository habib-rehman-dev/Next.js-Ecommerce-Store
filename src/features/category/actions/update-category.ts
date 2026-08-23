"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { slugify } from "@/lib/slugify";
import { Category } from "@/models/Category";
import type { ActionResult } from "@/lib/action-result";
import { updateCategorySchema } from "../validation";

export async function updateCategory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { id, ...data } = parsed.data;

  await dbConnect();

  const existing = await Category.findById(id);
  if (!existing) {
    return { success: false, message: "Category not found" };
  }

  // A category can't be its own parent, directly or transitively.
  if (data.parentCategoryId) {
    if (data.parentCategoryId === id) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { parentCategoryId: ["A category can't be its own parent"] },
      };
    }
    const parentExists = await Category.exists({ _id: data.parentCategoryId });
    if (!parentExists) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { parentCategoryId: ["Parent category not found"] },
      };
    }
  }

  let slug = existing.slug;
  if (data.slug) {
    slug = data.slug;
  } else if (data.name && data.name !== existing.name) {
    slug = slugify(data.name);
  }

  if (slug !== existing.slug) {
    const slugTaken = await Category.exists({ slug, _id: { $ne: id } });
    if (slugTaken) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { slug: ["A category with this slug already exists"] },
      };
    }
  }

  existing.set({
    ...(data.name !== undefined && { name: data.name }),
    slug,
    ...(data.description !== undefined && { description: data.description || undefined }),
    ...(data.image !== undefined && { image: data.image || undefined }),
    ...(data.parentCategoryId !== undefined && {
      parentCategoryId: data.parentCategoryId || null,
    }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
  });
  await existing.save();

  revalidatePath("/admin/categories");

  return { success: true, data: { id } };
}