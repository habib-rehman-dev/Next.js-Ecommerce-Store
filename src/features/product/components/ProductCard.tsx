// src/features/product/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IProduct } from "../types";
import { useCart } from "@/features/cart/context/CartProvider";
import { addToCart } from "@/features/cart/actions/add-to-cart";
import { toast } from "sonner";

type ProductCardProps = {
  product: IProduct;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { refreshCart } = useCart();

  const primaryImage = product.images?.[0];
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAddingToCart) return;

    const firstVariant = product.variants[0];
    if (!firstVariant) {
      toast.error("No variant available");
      return;
    }

    setIsAddingToCart(true);

    try {
      const result = await addToCart({
        productId: product._id,
        variantId: firstVariant._id || "",
        quantity: 1,
      });

      if (result.success) {
        refreshCart();
        toast.success("Added to cart!");
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[36px] border border-border/40 bg-[#F2F3F5] p-3.5 shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-gradient-to-b from-[#2A3036] via-[#20252A] to-[#A3B3C2]">
        {/* Trending Badge */}
        <div className="absolute left-3.5 top-3.5 z-10">
          <Badge className="rounded-full bg-[#32C850] px-3.5 py-1 text-xs font-semibold text-white hover:bg-[#32C850] border-none shadow-none">
            Trending
          </Badge>
        </div>

        {/* 3D Heart Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className={cn(
            "absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform active:scale-90",
            isWishlisted && "bg-white"
          )}
        >
          <span className="text-base select-none">
            {isWishlisted ? "❤️" : "🤍"}
          </span>
        </button>

        {/* Image Link */}
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-contain w-full transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white/60">
              No Image
            </div>
          )}
        </Link>
      </div>

      {/* Card Body */}
      <CardContent className="flex flex-col gap-2 p-4 pb-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.description ||
            "Lightweight, durable, and built for peak performance every step of the way."}
        </p>

        {/* Price & Action Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">
            ${lowestPrice.toFixed(2)}
          </span>

          <Button
            size="default"
            disabled={isOutOfStock || isAddingToCart}
            onClick={handleAddToCart}
            className="rounded-full bg-[#18181B] px-5 py-2.5 text-xs font-semibold text-white shadow-none hover:bg-black active:scale-95 transition-all"
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isOutOfStock ? (
              "Sold Out"
            ) : (
              "Add To Cart"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}