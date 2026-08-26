"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Coupon } from "@/models/Coupon";
import { couponSchema, CouponFormInput } from "../validation";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";

export async function createCoupon(data: CouponFormInput): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return actionError("Admin access required");
  }

  try {
    const validated = couponSchema.parse(data);
    await dbConnect();

    const existing = await Coupon.findOne({ code: validated.code });
    if (existing) {
      return actionError("Validation failed", {
        code: ["A coupon with this code already exists."],
      });
    }

    await Coupon.create({
      ...validated,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
    });

    revalidatePath("/admin/coupons");
    return actionSuccess(undefined, "Coupon created successfully!");
  } catch (error: unknown) {
    return actionError(
      error instanceof Error ? error.message : "Failed to create coupon.",
    );
  }
}