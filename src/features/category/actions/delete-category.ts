"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import type { ActionResult } from "@/lib/action-result";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  if (!id) {
    return { success: false, message: "Category id is required" };
  }

  await dbConnect();

  const [hasChildren, hasProducts] = await Promise.all([
    Category.exists({ parentCategoryId: id }),
    Product.exists({ categoryId: id }),
  ]);

  if (hasChildren) {
    return {
      success: false,
      message: "This category still has subcategories. Move or delete those first.",
    };
  }
  if (hasProducts) {
    return {
      success: false,
      message: "This category still has products assigned to it. Reassign those first.",
    };
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    return { success: false, message: "Category not found" };
  }

  // The DB row is already gone either way at this point, so a failed
  // Cloudinary cleanup shouldn't block the user or surface as an error —
  // just log it. (Nothing to roll back to: the delete already happened.)
  if (deleted.imagePublicId) {
    await deleteImageFromCloudinary(deleted.imagePublicId).catch((err) => {
      console.error("Failed to delete category image from Cloudinary:", err);
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidateTag("categories", "max");

  return { success: true, data: undefined };
}