"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Coupon } from "@/models/Coupon";
import { couponSchema, CouponFormInput } from "../validation";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";

export async function updateCoupon(
  id: string,
  data: CouponFormInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return actionError("Admin access required");
  }

  try {
    const validated = couponSchema.parse(data);
    await dbConnect();

    const existingCode = await Coupon.findOne({
      code: validated.code,
      _id: { $ne: id },
    });

    if (existingCode) {
      return actionError("Another coupon already uses this code.", {
        code: ["Another coupon already uses this code."],
      });
    }

    const updated = await Coupon.findByIdAndUpdate(
      id,
      {
        ...validated,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
      },
      { new: true }
    );

    if (!updated) {
      return actionError("Coupon not found.");
    }

    revalidatePath("/admin/coupons");
    revalidatePath(`/admin/coupons/${id}/edit`);
    return actionSuccess(undefined, "Coupon updated successfully!");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update coupon.";
    return actionError(message || "Failed to update coupon.");
  }
}