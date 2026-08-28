// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { dbConnect } from "@/lib/db/dbConnect";
import { Payment } from "@/models/Payment";
import { Order } from "@/models/Order";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            status: "succeeded",
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
          },
          { upsert: true }
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: "failed" }
        );
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        if (paymentIntentId) {
          const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
          if (payment) {
            await Payment.findByIdAndUpdate(payment._id, { status: "refunded" });
            await Order.findByIdAndUpdate(payment.orderId, {
              status: "cancelled",
              paymentStatus: "refunded",
            });
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
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}