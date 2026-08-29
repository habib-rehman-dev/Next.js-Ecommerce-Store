"use server";

import { Types } from "mongoose";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Wishlist } from "@/models/Wishlist";

const productIdSchema = z.object({
  productId: z.string().min(1),
});

export async function isProductWishlisted(productId: string): Promise<ActionResult<boolean>> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to view your wishlist");
  }

  await dbConnect();
  const wishlist = await Wishlist.findOne({ userId }).lean();
  const productIds = Array.isArray(wishlist?.productIds) ? wishlist.productIds : [];

  return actionSuccess(productIds.some((id: Types.ObjectId | string) => id.toString() === productId));
}

export async function toggleWishlist(input: unknown): Promise<ActionResult<{ isWishlisted: boolean }>> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to save items");
  }

  const parsed = productIdSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid request", parsed.error.flatten().fieldErrors);
  }

  const { productId } = parsed.data;

  await dbConnect();

  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, productIds: [] });
  }

  const targetId = new Types.ObjectId(productId);
  const exists = wishlist.productIds.some((id: Types.ObjectId) => id.toString() === productId);

  if (exists) {
    wishlist.productIds = wishlist.productIds.filter((id: Types.ObjectId) => id.toString() !== productId);
  } else {
    wishlist.productIds.push(targetId);
  }

  await wishlist.save();
  revalidateTag("wishlist", "max");

  return actionSuccess({ isWishlisted: !exists }, exists ? "Removed from wishlist" : "Saved to wishlist");
}
