// src/app/(marketing)/(shop)/addresses/page.tsx
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { getAddresses } from "@/features/address/queries/get-addresses";
import { AddressList } from "@/features/address/components/AddressList";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const addresses = await getAddresses();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AddressList addresses={addresses} />
    </div>
  );
}