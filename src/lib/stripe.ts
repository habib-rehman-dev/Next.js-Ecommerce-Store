// src/lib/stripe.ts
import Stripe from "stripe";
import { env } from "./env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia",
});

export function getStripePublishableKey() {
  return env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}