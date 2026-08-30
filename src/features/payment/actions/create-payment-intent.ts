// src/features/payment/actions/create-payment-intent.ts
"use server";

import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { getCart } from "@/features/cart/queries/get-cart";
import { Address } from "@/models/Address";
import { Order } from "@/models/Order";
import { Payment } from "@/models/Payment";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { actionSuccess, actionError, ActionResult } from "@/lib/action-result";

interface CreatePaymentIntentInput {
  shippingAddressId: string;
  couponCode?: string;
  shippingFee?: number;
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<ActionResult<{ clientSecret: string; orderId: string; amount: number; discount: number }>> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to check out");
  }

  const { shippingAddressId, couponCode, shippingFee = 0 } = input;
  if (!shippingAddressId) return actionError("Shipping address is required");

  await dbConnect();

  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    return actionError("Your cart is empty");
  }

  const address = await Address.findOne({ _id: shippingAddressId, userId });
  if (!address) return actionError("Shipping address not found");

  // Snapshot items and re-validate stock now, up front. This is a read-only
  // check — the webhook does the real atomic decrement once Stripe confirms
  // the payment actually went through.
  const productIds = [...new Set(cart.items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let orderItems;
  try {
    orderItems = cart.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`${item.productName} is no longer available`);

      const variant = product.variants.find(
        (v: { _id?: { toString(): string } }) => v._id?.toString() === item.variantId
      );
      if (!variant) {
        throw new Error(`Selected option for ${item.productName} is no longer available`);
      }
      if (variant.stock < item.quantity) {
        throw new Error(`Only ${variant.stock} unit(s) left for ${item.productName}`);
      }

      const unitPrice = item.discountPrice ?? item.price;
      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        attributes: item.attributes || {},
        unitPrice,
        quantity: item.quantity,
        lineTotal: unitPrice * item.quantity,
      };
    });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Please review your cart");
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);

  // Authoritative coupon validation — never trust a discount amount from the
  // client. If the code is invalid for any reason at this point, we simply
  // don't apply a discount rather than blocking checkout.
  let discount = 0;
  let appliedCouponCode: string | undefined;

  if (couponCode) {
    const normalized = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalized }).lean();

    const isValid =
      coupon &&
      coupon.status === "active" &&
      (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
      (coupon.maxUses === undefined || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrderValue || subtotal >= coupon.minOrderValue);

    if (isValid) {
      discount = Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100;
      appliedCouponCode = coupon.code;
    }
    // Invalid/expired/exhausted coupon at this point is silently dropped —
    // the UI already validated it via validateCoupon before letting the
    // user reach this step, so this only fires on a genuine race (e.g.
    // someone else used the last redemption slot seconds ago).
  }

  const total = Math.max(subtotal + shippingFee - discount, 0);

  // Create the Order in "pending" BEFORE talking to Stripe — this is the
  // source of truth the webhook will look up and finalize.
  let order;
  try {
    order = await Order.create({
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
      discount,
      couponCode: appliedCouponCode,
      shippingFee,
      total,
      currency: "usd",
      status: "pending",
      paymentStatus: "pending",
    });
  } catch (error) {
    console.error("Failed to create pending order:", error);
    return actionError("Failed to start checkout. Please try again.");
  }

  try {
    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        userId,
        orderId: order._id.toString(),
      },
    });

    await Payment.create({
      orderId: order._id,
      userId,
      provider: "stripe",
      amount: total,
      currency: "usd",
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    });

    return actionSuccess({
      clientSecret: paymentIntent.client_secret!,
      orderId: order._id.toString(),
      amount: amountInCents,
      discount,
    });
  } catch (error) {
    // Stripe (or the Payment insert) failed after the Order was created —
    // roll the Order back so we don't leave an orphaned pending order that
    // can never be paid.
    await Order.findByIdAndDelete(order._id).catch((err) => {
      console.error("Failed to roll back orphaned order:", err);
    });
    return actionError(
      error instanceof Error ? error.message : "Failed to start payment. Please try again."
    );
  }
}