
import { getCart } from "@/features/cart/queries/get-cart";
import { CartPageClient } from "./CartPageClient";

export default async function CartPage() {
  const cart = await getCart();
  return <CartPageClient initialCart={cart} />;
}