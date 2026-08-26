"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";
import { Brand } from "@/models/Brand";
import { Product } from "@/models/Product";

export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  if (!id) {
    return { success: false, message: "Brand id is required" };
  }

  await dbConnect();

  try {
    const hasProducts = await Product.exists({ brandId: id });
    if (hasProducts) {
      return {
        success: false,
        message: "This brand still has products assigned to it. Reassign those first.",
      };
    }

    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, message: "Brand not found" };
    }

    if (deleted.logoPublicId) {
      await deleteImageFromCloudinary(deleted.logoPublicId).catch((err) => {
        console.error("Failed to delete brand image from Cloudinary:", err);
      });
    }

    revalidatePath("/admin/brands");
    revalidateTag("brands");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete brand:", error);
    return { success: false, message: "Failed to delete brand. Please try again." };
  }
}
