import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { getCart } from "@/features/cart/queries/get-cart";
import { getAddresses } from "@/features/address/queries/get-addresses";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
	try {
		await requireAuth();
	} catch {
		redirect("/sign-in");
	}

	const [cart, addresses] = await Promise.all([getCart(), getAddresses()]);

	if (!cart || cart.items.length === 0) {
		redirect("/cart");
	}

	return <CheckoutClient cart={cart} addresses={addresses} />;
}
