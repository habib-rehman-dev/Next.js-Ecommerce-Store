import Header from "../components/Header";
import { CartProvider } from "@/features/cart/context/CartProvider";
import { getInitialCart } from "@/features/cart/queries/get-initial-cart";



export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialCart = await getInitialCart();

  return (
    <div className="w-full border rounded-lg p-5">
      <CartProvider initialCart={initialCart}>
        <Header />
        {children}
      </CartProvider>
    </div>
  );
}