"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import type { ActionResult } from "@/lib/action-result";

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

  revalidatePath("/admin/categories");

  return { success: true, data: undefined };
}