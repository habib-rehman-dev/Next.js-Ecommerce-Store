// src/features/address/actions/update-address.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Address } from "@/models/Address";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";

import { updateAddressSchema } from "../validation";

export async function updateAddress(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to manage your addresses");
  }

  const id = formData.get("id")?.toString() ?? "";
  if (!id) return actionError("Address id is required");

  await dbConnect();

  // Scope the lookup to this user — prevents editing someone else's address
  // by guessing an id.
  const existing = await Address.findOne({ _id: id, userId });
  if (!existing) return actionError("Address not found");

  const raw = {
    id,
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

  const parsed = updateAddressSchema.safeParse(raw);
  if (!parsed.success) {
    return actionError("Please fix the errors below", parsed.error.flatten().fieldErrors);
  }
  const { id: _id, ...data } = parsed.data;

  try {
    if (data.isDefault) {
      await Address.updateMany(
        { userId, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    existing.set({
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
      ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 || undefined }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    });

    await existing.save();

    // Guard against ending up with zero default addresses (e.g. the user
    // unchecked "default" on the address that was the only default).
    const stillHasDefault = await Address.exists({ userId, isDefault: true });
    if (!stillHasDefault) {
      const fallback = await Address.findOne({ userId }).sort({ createdAt: 1 });
      if (fallback) {
        fallback.isDefault = true;
        await fallback.save();
      }
    }

    revalidatePath("/addresses");
    revalidateTag("addresses", "max");
    return actionSuccess({ id }, "Address updated");
  } catch (error) {
    console.error("Failed to update address:", error);
    return actionError("Failed to update address. Please try again.");
  }
}