// src/app/(marketing)/cart/CartPageClient.tsx
"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Loader2,
  
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { updateCartItem } from "@/features/cart/actions/update-cart-item";
import { removeCartItem } from "@/features/cart/actions/remove-cart-item";
import type { ICartDTO } from "@/features/cart/types";
import { useCart } from "@/features/cart/context/CartProvider";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

type Props = {
  initialCart: ICartDTO | null;
};

export function CartPageClient({ initialCart }: Props) {
  const router = useRouter();
  const { cart, refreshCart, isPending: contextPending } = useCart();
  const [isPending, startTransition] = useTransition();

  // Use context cart or fallback to initial
  const displayCart = cart?.items?.length ? cart : initialCart;
  const items = displayCart?.items || [];
  const subtotal = displayCart?.subtotal || 0;

  const handleQuantityChange = (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    if (quantity < 1) return;
    startTransition(async () => {
      const result = await updateCartItem({ productId, variantId, quantity });
      if (result.success) {
        refreshCart();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRemove = (productId: string, variantId: string) => {
    startTransition(async () => {
      const result = await removeCartItem({ productId, variantId });
      if (result.success) {
        refreshCart();
        toast.success("Item removed from cart");
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
        <Badge variant="secondary" className="ml-auto">
          {items.length} {items.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.discountPrice ?? item.price;
            const isOutOfStock = item.stock === 0;

            return (
              <Card
                key={`${item.productId}-${item.variantId}`}
                className="overflow-hidden"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted self-center sm:self-start"
                    >
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku}
                      </p>
                      {Object.keys(item.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.attributes).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="text-xs"
                              >
                                {key}: {value}
                              </Badge>
                            ),
                          )}
                        </div>
                      )}
                      {isOutOfStock && (
                        <Badge variant="destructive" className="mt-2">
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    {/* Price & Quantity */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                      <div className="text-lg font-semibold text-primary">
                        {formatPrice(price * item.quantity)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          disabled={isPending || contextPending}
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.variantId,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          disabled={isPending || contextPending || isOutOfStock}
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={isPending || contextPending}
                        onClick={() =>
                          handleRemove(item.productId, item.variantId)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={
                  isPending ||
                  contextPending ||
                  items.some((i) => i.stock === 0)
                }
              >
                {isPending || contextPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
