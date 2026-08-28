// src/features/payment/actions/confirm-order.ts
"use server";

import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import { Payment } from "@/models/Payment";
import { Cart } from "@/models/Cart";
import { getCart } from "@/features/cart/queries/get-cart";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";

interface ConfirmOrderInput {
  paymentIntentId: string;
  shippingAddressId: string;
  couponCode?: string;
}

export async function confirmOrder(
  input: ConfirmOrderInput
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const userId = await requireAuth();
    await dbConnect();

    // 1. Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      input.paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      return actionError("Payment has not been confirmed");
    }

    // 2. Get cart
    const cart = await getCart();
    if (!cart || cart.items.length === 0) {
      return actionError("Your cart is empty");
    }

    // 3. Get shipping address
    const { Address } = await import("@/models/Address");
    const address = await Address.findOne({
      _id: input.shippingAddressId,
      userId,
    });

    if (!address) {
      return actionError("Shipping address not found");
    }

    // 4. Build order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      sku: item.sku,
      attributes: item.attributes || {},
      unitPrice: item.discountPrice || item.price,
      quantity: item.quantity,
      lineTotal: (item.discountPrice || item.price) * item.quantity,
    }));

    // 5. Calculate totals
    const subtotal = cart.subtotal;
    const total = subtotal;

    // 6. Create order
    const order = await Order.create({
      userId,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      subtotal,
      discount: 0,
      couponCode: input.couponCode,
      shippingFee: 0,
      total,
      currency: "usd",
      status: "pending",
      paymentStatus: "paid",
    });

    // 7. Update payment record
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        orderId: order._id,
        userId,
        amount: total,
        currency: "usd",
        status: "succeeded",
      },
      { upsert: true }
    );

    // 8. Clear cart
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    revalidatePath("/orders");
    return actionSuccess({ orderId: order._id.toString() });
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to confirm order"
    );
  }
}