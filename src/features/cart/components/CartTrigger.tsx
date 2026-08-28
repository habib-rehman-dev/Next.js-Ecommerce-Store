"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";

export function CartTrigger({ initialCount }: { initialCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
        <ShoppingBag className="h-5 w-5" />
        {initialCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {initialCount > 99 ? "99+" : initialCount}
          </span>
        )}
        <span className="sr-only">Open cart</span>
      </Button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}