// src/features/cart/components/CartTrigger.tsx (Update existing)
"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "../context/CartProvider";

export function CartTrigger() {
  const [open, setOpen] = useState(false);
  const { cart, isPending } = useCart();
  const itemCount = cart?.itemCount || 0;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative" 
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground animate-in fade-in zoom-in">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
        <span className="sr-only">Open cart</span>
      </Button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}