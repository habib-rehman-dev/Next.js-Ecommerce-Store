"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { addToCartSchema } from "../validation";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";

export async function addToCart(input: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to add items to your cart");
  }

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid request", parsed.error.flatten().fieldErrors);
  }
  const { productId, variantId, quantity } = parsed.data;

  await dbConnect();

  const product = await Product.findById(productId).lean();
  if (!product) return actionError("Product not found");

  const variant = product.variants.find(
    (v: { _id?: { toString(): string } }) => v._id?.toString() === variantId
  );
  if (!variant) return actionError("Selected variant not found");
  if (variant.stock < quantity) return actionError(`Only ${variant.stock} in stock`);

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });

  const existingItem = cart.items.find(
    (i: { productId: { toString(): string }; variantId: { toString(): string } }) =>
      i.productId.toString() === productId && i.variantId.toString() === variantId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > variant.stock) return actionError(`Only ${variant.stock} in stock`);
    existingItem.quantity = newQty;
  } else {
    cart.items.push({ productId, variantId, quantity });
  }

  await cart.save();

  revalidatePath("/cart");
  revalidateTag("cart", "max");

  return actionSuccess(undefined, "Added to cart");
}