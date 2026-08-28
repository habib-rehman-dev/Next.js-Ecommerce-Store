// src/features/address/actions/delete-address.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Address } from "@/models/Address";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";

export async function deleteAddress(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to manage your addresses");
  }

  if (!id) return actionError("Address id is required");

  await dbConnect();

  const deleted = await Address.findOneAndDelete({ _id: id, userId });
  if (!deleted) return actionError("Address not found");

  // If the deleted address was the default and others remain, promote the
  // most recently added one so there's always a default when possible.
  if (deleted.isDefault) {
    const fallback = await Address.findOne({ userId }).sort({ createdAt: -1 });
    if (fallback) {
      fallback.isDefault = true;
      await fallback.save();
    }
  }

  revalidatePath("/addresses");
  revalidateTag("addresses", "max");
  return actionSuccess(undefined, "Address removed");
}