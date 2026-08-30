// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { dbConnect } from "@/lib/db/dbConnect";
import { Payment } from "@/models/Payment";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Cart } from "@/models/Cart";
import { Coupon } from "@/models/Coupon";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

        if (!payment) {
          console.error(`No Payment record found for PaymentIntent ${paymentIntent.id}`);
          break;
        }

        // Idempotency guard — Stripe may redeliver this event.
        if (payment.status === "succeeded") break;

        const order = await Order.findById(payment.orderId);
        if (!order) {
          console.error(`No Order found for Payment ${payment._id.toString()}`);
          break;
        }

        // Decrement stock only now that payment is confirmed. Best-effort
        // per line item: since we validated stock when the PaymentIntent was
        // created, mismatches here should be rare — log rather than reject
        // an order that's already been paid for.
        for (const item of order.items) {
          const result = await Product.updateOne(
            {
              _id: item.productId,
              "variants._id": item.variantId,
              "variants.stock": { $gte: item.quantity },
            },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
          if (result.matchedCount === 0) {
            console.error(
              `Stock mismatch on paid order ${order._id.toString()}: ${item.productName} (${item.sku})`
            );
          }
        }

        // Only now — on a confirmed, successful payment — does the coupon
        // redemption actually count. Abandoned/failed checkouts never touch
        // usedCount, which is why the discount math up in
        // create-payment-intent.ts doesn't increment it itself.
        if (order.couponCode) {
          await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
        }

        await Payment.updateOne(
          { _id: payment._id },
          {
            status: "succeeded",
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
          }
        );

        await Order.updateOne(
          { _id: order._id },
          { status: "processing", paymentStatus: "paid" }
        );

        await Cart.findOneAndUpdate({ userId: order.userId }, { $set: { items: [] } });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

        if (payment) {
          await Payment.updateOne({ _id: payment._id }, { status: "failed" });
          await Order.updateOne(
            { _id: payment.orderId },
            { status: "cancelled", paymentStatus: "failed" }
          );
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        if (paymentIntentId) {
          const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
          if (payment) {
            await Payment.updateOne({ _id: payment._id }, { status: "refunded" });
            await Order.updateOne(
              { _id: payment.orderId },
              { status: "cancelled", paymentStatus: "refunded" }
            );
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}