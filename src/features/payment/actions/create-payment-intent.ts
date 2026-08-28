// src/features/payment/actions/create-payment-intent.ts
"use server";

import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";
import { getCart } from "@/features/cart/queries/get-cart";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";

export async function createPaymentIntent(
  shippingCost: number = 0
): Promise<ActionResult<{ clientSecret: string; amount: number }>> {
  try {
    const userId = await requireAuth();
    const cart = await getCart();

    if (!cart || cart.items.length === 0) {
      return actionError("Your cart is empty");
    }

    const totalAmount = Math.round((cart.subtotal + shippingCost) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "usd",
      metadata: {
        userId,
        cartId: cart.id,
        itemCount: String(cart.itemCount),
      },
    });

    return actionSuccess({
      clientSecret: paymentIntent.client_secret!,
      amount: totalAmount,
    });
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to create payment intent"
    );
  }
}