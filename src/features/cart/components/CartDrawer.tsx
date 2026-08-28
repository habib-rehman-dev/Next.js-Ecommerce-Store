"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Loader2 } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getCartAction } from "../actions/get-cart-action";
import { updateCartItem } from "../actions/update-cart-item";
import { removeCartItem } from "../actions/remove-cart-item";
import type { ICartDTO } from "../types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function CartDrawer({ open, onOpenChange }: Props) {
  const [cart, setCart] = useState<ICartDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function loadCart() {
      setIsLoading(true);
      const nextCart = await getCartAction();
      if (!cancelled) {
        setCart(nextCart);
        setIsLoading(false);
      }
    }

    void loadCart();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function refreshCart() {
    startTransition(async () => setCart(await getCartAction()));
  }

  function handleQuantityChange(productId: string, variantId: string, quantity: number) {
    if (quantity < 1) return;
    startTransition(async () => {
      const result = await updateCartItem({ productId, variantId, quantity });
      if (result.success) refreshCart();
    });
  }

  function handleRemove(productId: string, variantId: string) {
    startTransition(async () => {
      const result = await removeCartItem({ productId, variantId });
      if (result.success) refreshCart();
    });
  }

  const items = cart?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Your Cart {cart && cart.itemCount > 0 && `(${cart.itemCount})`}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              nativeButton={false}
              render={<Link href="/products" />}
            >
              Browse products
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col divide-y">
                {items.map((item) => {
                  const price = item.discountPrice ?? item.price;
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 p-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {item.productImage && (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={() => onOpenChange(false)}
                          className="text-sm font-medium truncate hover:text-primary"
                        >
                          {item.productName}
                        </Link>
                        {Object.keys(item.attributes || {}).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={isPending}
                              onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={isPending || item.quantity >= item.stock}
                              onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold">{formatPrice(price * item.quantity)}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={isPending}
                        onClick={() => handleRemove(item.productId, item.variantId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator />

            <SheetFooter className="gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-base">{formatPrice(cart?.subtotal ?? 0)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                nativeButton={false}
                render={<Link href="/checkout" />}
                onClick={() => onOpenChange(false)}
              >
                Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}