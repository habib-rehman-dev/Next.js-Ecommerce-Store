// src/features/product/actions/toggle-featured.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { ActionResult } from "@/lib/action-result";

export async function toggleProductFeatured(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  const productId = formData.get("productId")?.toString();
  const featured = formData.get("featured") === "true";

  if (!productId) {
    return { success: false, message: "Product ID is required" };
  }

  try {
    await dbConnect();

    const product = await Product.findByIdAndUpdate(
      productId,
      { isFeatured: featured },
      { new: true }
    );

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/featured");
    revalidatePath("/");
    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");

    return { 
      success: true, 
      message: `Product ${featured ? 'featured' : 'unfeatured'} successfully` 
    };
  } catch (error) {
    console.error("Error toggling featured status:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update product" 
    };
  }
}

export async function toggleProductFeaturedForm(formData: FormData): Promise<void> {
  await toggleProductFeatured(formData);
}