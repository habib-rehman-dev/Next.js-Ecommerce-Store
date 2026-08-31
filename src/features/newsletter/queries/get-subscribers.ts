// src/features/newsletter/queries/get-subscribers.ts
import "server-only";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Newsletter } from "@/models/Newsletter";

export async function getSubscribers() {
  await requireAdmin();
  await dbConnect();
  const subscribers = await Newsletter.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(subscribers));
}

export async function getSubscriberCount(): Promise<number> {
  await requireAdmin();
  await dbConnect();
  return Newsletter.countDocuments();
}