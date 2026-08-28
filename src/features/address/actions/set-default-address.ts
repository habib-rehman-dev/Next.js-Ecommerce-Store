// src/features/address/actions/set-default-address.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Address } from "@/models/Address";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to manage your addresses");
  }

  if (!id) return actionError("Address id is required");

  await dbConnect();

  const target = await Address.findOne({ _id: id, userId });
  if (!target) return actionError("Address not found");

  await Address.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
  target.isDefault = true;
  await target.save();

  revalidatePath("/addresses");
  revalidateTag("addresses", "max");
  return actionSuccess(undefined, "Default address updated");
}