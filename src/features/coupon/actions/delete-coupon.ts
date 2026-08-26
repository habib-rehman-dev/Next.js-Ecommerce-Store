"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Coupon } from "@/models/Coupon";
import { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";

export async function deleteCoupon(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  try {
    await dbConnect();

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, message: "Coupon not found." };
    }

    revalidatePath("/admin/coupons");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete coupon.",
    };
  }
}