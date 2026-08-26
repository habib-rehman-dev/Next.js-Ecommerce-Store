"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { ActionResult } from "@/lib/action-result";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  try {
    await dbConnect();

    const product = await Product.findById(id);
    if (!product) {
      return { success: false, message: "Product not found." };
    }

    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      await Promise.all(
        product.imagePublicIds.map((pubId: string) =>
          deleteImageFromCloudinary(pubId)
        )
      );
    }

    await Product.findByIdAndDelete(id);

    revalidatePath("/admin/products");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete product.",
    };
  }
}