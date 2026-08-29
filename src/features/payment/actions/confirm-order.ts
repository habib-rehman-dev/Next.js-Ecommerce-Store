// src/features/payment/actions/confirm-order.ts
"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import { Payment } from "@/models/Payment";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
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

    const paymentIntent = await stripe.paymentIntents.retrieve(
      input.paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      return actionError("Payment has not been confirmed");
    }

    const cart = await getCart();
    if (!cart || cart.items.length === 0) {
      return actionError("Your cart is empty");
    }

    const { Address } = await import("@/models/Address");
    const address = await Address.findOne({
      _id: input.shippingAddressId,
      userId,
    });

    if (!address) {
      return actionError("Shipping address not found");
    }

    const productIds = [...new Set(cart.items.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const orderItems = cart.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} no longer exists`);
      }

      const variant = product.variants.find(
        (variantItem: { _id?: { toString(): string } }) =>
          variantItem._id?.toString() === item.variantId
      );

      if (!variant) {
        throw new Error(`Selected variant for ${item.productName} is no longer available`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Only ${variant.stock} unit(s) left for ${item.productName}`);
      }

      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        attributes: item.attributes || {},
        unitPrice: item.discountPrice ?? item.price,
        quantity: item.quantity,
        lineTotal: (item.discountPrice ?? item.price) * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = subtotal;

    const session = await mongoose.startSession();
    let orderId = "";

    await session.withTransaction(async () => {
      for (const item of cart.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} no longer exists`);
        }

        const matchedVariant = product.variants.find(
          (variantItem: { _id?: { toString(): string } }) =>
            variantItem._id?.toString() === item.variantId
        );

        if (!matchedVariant) {
          throw new Error(`Variant ${item.variantId} no longer exists`);
        }

        const result = await Product.updateOne(
          {
            _id: product._id,
            "variants._id": item.variantId,
            "variants.$.stock": { $gte: item.quantity },
          },
          {
            $inc: { "variants.$.stock": -item.quantity },
          },
          { session }
        );

        if (result.matchedCount === 0) {
          throw new Error(`Inventory changed for ${item.productName}; please review your cart`);
        }
      }

      const order = await Order.create(
        [
          {
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
          },
        ],
        { session }
      );

      orderId = order[0]._id.toString();

      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          orderId: order[0]._id,
          userId,
          provider: "stripe",
          amount: total,
          currency: "usd",
          status: "succeeded",
        },
        { upsert: true, new: true, session }
      );

      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { session }
      );
    });

    revalidatePath("/orders");
    return actionSuccess({ orderId: orderId || "" });
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to confirm order"
    );
  }
}