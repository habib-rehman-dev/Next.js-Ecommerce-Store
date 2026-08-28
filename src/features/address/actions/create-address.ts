// src/features/address/actions/create-address.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Address } from "@/models/Address";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";

import { addressSchema } from "../validation";

export async function createAddress(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to manage your addresses");
  }

  const raw = {
    fullName: formData.get("fullName")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    addressLine1: formData.get("addressLine1")?.toString() ?? "",
    addressLine2: formData.get("addressLine2")?.toString() ?? "",
    city: formData.get("city")?.toString() ?? "",
    state: formData.get("state")?.toString() ?? "",
    postalCode: formData.get("postalCode")?.toString() ?? "",
    country: formData.get("country")?.toString() ?? "",
    isDefault: formData.get("isDefault")?.toString() === "true",
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return actionError("Please fix the errors below", parsed.error.flatten().fieldErrors);
  }
  const data = parsed.data;

  await dbConnect();

  try {
    // A user's very first address is always the default, regardless of the
    // checkbox — there must never be zero default addresses once one exists.
    const existingCount = await Address.countDocuments({ userId });
    const shouldBeDefault = data.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
    }

    const address = await Address.create({
      userId,
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || undefined,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      isDefault: shouldBeDefault,
    });

    revalidatePath("/addresses");
    revalidateTag("addresses", "max");
    return actionSuccess({ id: address._id.toString() }, "Address added");
  } catch (error) {
    console.error("Failed to create address:", error);
    return actionError("Failed to save address. Please try again.");
  }
}