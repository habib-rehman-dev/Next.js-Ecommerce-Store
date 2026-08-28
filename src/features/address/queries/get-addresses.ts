
import "server-only";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Address } from "@/models/Address";
import type { IAddressDTO } from "../types";

/**
 * Addresses are per-user and auth-gated, so this intentionally does NOT use
 * unstable_cache (same reasoning as features/cart/queries/get-cart.ts) —
 * caching would either leak between users or require per-user cache keys
 * for no real benefit on a low-traffic query like this.
 */
export async function getAddresses(): Promise<IAddressDTO[]> {
  const userId = await requireAuth();
  await dbConnect();

  const addresses = await Address.find({ userId })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  return addresses.map((a) => ({
    id: a._id.toString(),
    fullName: a.fullName,
    phone: a.phone,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    isDefault: a.isDefault,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}