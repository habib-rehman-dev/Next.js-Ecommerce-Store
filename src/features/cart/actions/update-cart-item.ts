"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { updateCartItemSchema } from "../validation";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";

export async function updateCartItem(input: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to modify your cart");
  }

  const parsed = updateCartItemSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid request", parsed.error.flatten().fieldErrors);
  }
  const { productId, variantId, quantity } = parsed.data;

  await dbConnect();

  const cart = await Cart.findOne({ userId });
  if (!cart) return actionError("Cart not found");

  const item = cart.items.find(
    (i: { productId: { toString(): string }; variantId: { toString(): string } }) =>
      i.productId.toString() === productId && i.variantId.toString() === variantId
  );
  if (!item) return actionError("Item not found in cart");

  const product = await Product.findById(productId).lean();
  const variant = product?.variants.find(
    (v: { _id?: { toString(): string } }) => v._id?.toString() === variantId
  );
  if (!variant) return actionError("Variant no longer available");
  if (quantity > variant.stock) return actionError(`Only ${variant.stock} in stock`);

  item.quantity = quantity;
  await cart.save();

  revalidatePath("/cart");
  revalidateTag("cart", "max");

  return actionSuccess(undefined, "Cart updated");
}