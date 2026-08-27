"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Newsletter } from "@/models/Newsletter";
import type { INewsletter } from "@/models/Newsletter";
import { newsletterSchema, NewsletterInput } from "../validation";
import { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function subscribeToNewsletter(
  data: NewsletterInput
): Promise<ActionResult> {
  try {
    const validated = newsletterSchema.parse(data);
    await dbConnect();

    const existing = await Newsletter.findOne({ email: validated.email });
    if (existing) {
      return {
        success: false,
        message: "You're already subscribed!",
        fieldErrors: { email: ["This email is already subscribed"] },
      };
    }

    await Newsletter.create({
      email: validated.email,
      source: validated.source,
      isConfirmed: true,
    });

    try {
      await sendWelcomeEmail(validated.email);
    } catch (error) {
      console.error("Email sending failed:", error);
    }

    revalidatePath("/admin/subscribers");
    revalidateTag("subscribers", "max");

    return {
      success: true,
      message: "Thank you for subscribing! Check your inbox for a welcome email.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error
        ? error.message || "Failed to subscribe. Please try again."
        : "Something went wrong. Please try again.",
    };
  }
}

export async function getSubscribers(): Promise<Array<INewsletter & { _id: string }>> {
  await dbConnect();
  const subscribers = await Newsletter.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(subscribers));
}

export async function getSubscriberCount(): Promise<number> {
  await dbConnect();
  return Newsletter.countDocuments();
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await dbConnect();

    const deleted = await Newsletter.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, message: "Subscriber not found" };
    }

    revalidatePath("/admin/subscribers");
    revalidateTag("subscribers", "max");
    return { success: true, message: "Subscriber removed successfully" };
  } catch {
    return { success: false, message: "Admin access required" };
  }
}

export async function deleteSubscriberForm(formData: FormData): Promise<void> {
  const id = formData.get("subscriberId")?.toString();
  if (id) {
    await deleteSubscriber(id);
  }
}
