"use client";

import { useTransition } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "../context/CartProvider";
// import { addToCart } from "../actions/cart-actions";
import { addToCart } from "../actions/add-to-cart";

type Props = { productId: string; variantId: string; quantity: number; disabled?: boolean };

export function AddToCartButton({ productId, variantId, quantity, disabled }: Props) {
  const { refreshCart } = useCart();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await addToCart({ productId, variantId, quantity });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      refreshCart();
      toast.success(result.message ?? "Added to cart");
    });
  }

  return (
    <Button className="flex-1 gap-2" disabled={disabled || isPending} onClick={handleClick}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
      {disabled ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}