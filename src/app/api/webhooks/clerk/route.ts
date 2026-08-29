import { NextRequest, NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { env } from "@/lib/env";
import { dbConnect } from "@/lib/db/dbConnect";
import { User } from "@/models/User";

/**
 * Verifies the Clerk webhook signature using the current Clerk API, then syncs
 * the local User collection with the latest Clerk user state.
 */
export async function POST(req: NextRequest) {
  try {
    const event = (await verifyWebhook(req, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET ?? env.CLERK_WEBHOOK_SECRET,
    })) as WebhookEvent;

    await dbConnect();

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const data = event.data;

        const primaryEmail = data.email_addresses.find(
          (email) => email.id === data.primary_email_address_id
        )?.email_address;

        const email = primaryEmail ?? data.email_addresses[0]?.email_address;

        if (!email) {
          console.error(`Clerk ${event.type} event for ${data.id} has no email; skipping`);
          break;
        }

        const role = data.public_metadata?.role === "admin" ? "admin" : "customer";

        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            clerkId: data.id,
            email,
            avatarUrl: data.image_url || undefined,
            firstName: data.first_name || undefined,
            lastName: data.last_name || undefined,
            role,
            status: "active",
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        break;
      }

      case "user.deleted": {
        const clerkId = event.data.id;
        if (!clerkId) break;

        await User.findOneAndDelete({ clerkId });
        break;
      }

      default:
        console.log(`Unhandled Clerk webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook handler error:", error);
    return NextResponse.json({ error: "Invalid or failed webhook request" }, { status: 400 });
  }
}