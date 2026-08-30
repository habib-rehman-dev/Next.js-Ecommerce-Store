// src/features/coupon/actions/validate-coupon.ts
"use server";

import { dbConnect } from "@/lib/db/dbConnect";
import { Coupon } from "@/models/Coupon";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";

export type CouponPreview = {
  code: string;
  discountValue: number; // percentage, e.g. 10 for 10%
  discountAmount: number; // computed off the subtotal passed in
};

/**
 * Client-facing check used for instant "Apply" feedback at checkout.
 * NOT the source of truth — createPaymentIntent re-validates and
 * recomputes the discount server-side against the authoritative subtotal
 * before charging, so a stale/tampered subtotal here can't affect the
 * actual amount charged.
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<ActionResult<CouponPreview>> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return actionError("Enter a coupon code");

  await dbConnect();

  const coupon = await Coupon.findOne({ code: normalized }).lean();
  if (!coupon) return actionError("Coupon not found");

  if (coupon.status !== "active") {
    return actionError("This coupon is no longer active");
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return actionError("This coupon has expired");
  }
  if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return actionError("This coupon has reached its usage limit");
  }
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return actionError(
      `This coupon requires a minimum order of $${coupon.minOrderValue.toFixed(2)}`
    );
  }

  const discountAmount = Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100;

  return actionSuccess({
    code: coupon.code,
    discountValue: coupon.discountValue,
    discountAmount,
  });
}