"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Cart } from "@/models/Cart";
import { removeCartItemSchema } from "../validation";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";

export async function removeCartItem(input: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to modify your cart");
  }

  const parsed = removeCartItemSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid request", parsed.error.flatten().fieldErrors);
  }
  const { productId, variantId } = parsed.data;

  await dbConnect();

  const cart = await Cart.findOne({ userId });
  if (!cart) return actionError("Cart not found");

  cart.items = cart.items.filter(
    (i: { productId: { toString(): string }; variantId: { toString(): string } }) =>
      !(i.productId.toString() === productId && i.variantId.toString() === variantId)
  );
  await cart.save();

  revalidatePath("/cart");
  revalidateTag("cart", "max");

  return actionSuccess(undefined, "Item removed");
}