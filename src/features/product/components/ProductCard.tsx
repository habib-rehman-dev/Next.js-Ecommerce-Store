// src/features/product/components/ProductCard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Heart } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import { RatingStars } from "@/features/review/components/RatingStars";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { IProduct } from "../types";
import { useCart } from "@/features/cart/context/CartProvider";
import { addToCart } from "@/features/cart/actions/add-to-cart";
import {
  isProductWishlisted,
  toggleWishlist,
} from "@/features/wishlist/actions/wishlist-actions";

type ProductCardProps = {
  product: IProduct;
  rating?: { average: number; count: number };
  className?: string;
};

export function ProductCard({ product, rating, className }: ProductCardProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { refreshCart } = useCart();

  const primaryImage = product.images?.[0];

  // Single source of truth: the variant we display the price for is the
  // SAME variant we add to the cart. Picks the variant with the lowest
  // effective (discount-aware) price.
  const bestVariant = product.variants.reduce((best, v) => {
    const bestEffective = best.discountPrice ?? best.price;
    const vEffective = v.discountPrice ?? v.price;
    return vEffective < bestEffective ? v : best;
  }, product.variants[0]);

  const effectivePrice = bestVariant.discountPrice ?? bestVariant.price;
  const hasDiscount =
    bestVariant.discountPrice != null && bestVariant.discountPrice < bestVariant.price;

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  useEffect(() => {
    if (!isSignedIn) {
      setIsWishlisted(false);
      setIsCheckingWishlist(false);
      return;
    }

    let active = true;
    setIsCheckingWishlist(true);

    void (async () => {
      const result = await isProductWishlisted(product._id);
      if (!active) return;

      if (result.success) {
        setIsWishlisted(Boolean(result.data));
      }
      setIsCheckingWishlist(false);
    })();

    return () => {
      active = false;
    };
  }, [isSignedIn, product._id]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to save products");
      return;
    }

    setIsTogglingWishlist(true);

    try {
      const result = await toggleWishlist({ productId: product._id });

      if (result.success) {
        setIsWishlisted(Boolean(result.data?.isWishlisted));
      } else {
        toast.error(result.message || "Could not update wishlist");
      }
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAddingToCart) return;

    if (!isSignedIn) {
      toast.error("Please sign in to add items to your cart");
      router.push("/sign-in");
      return;
    }

    if (!bestVariant?._id) {
      toast.error("No variant available");
      return;
    }

    setIsAddingToCart(true);

    try {
      const result = await addToCart({
        productId: product._id,
        variantId: bestVariant._id,
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
        "group relative flex flex-col justify-between p-0 overflow-hidden rounded-[36px] border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-md",
        className,
      )}
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-[28px] bg-muted">
        {/* Trending Badge */}
        <div className="absolute left-3.5 top-3.5 z-10">
          <Badge className="rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600 border-none shadow-none">
            Trending
          </Badge>
        </div>

        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={isCheckingWishlist || isTogglingWishlist}
          onClick={handleWishlistToggle}
          className={cn(
            "absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-60",
            isWishlisted && "bg-background",
          )}
        >
          {isCheckingWishlist || isTogglingWishlist ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-foreground",
              )}
            />
          )}
        </button>

        {/* Image Link */}
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-contain h-full w-full transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </Link>
      </div>

      {/* Card Body */}
      <CardContent className="flex flex-col gap-2 p-4 pb-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description ||
            "Lightweight, durable, and built for peak performance every step of the way."}
        </p>

        {rating && rating.count > 0 && (
          <div className="flex items-center gap-1.5">
            <RatingStars value={rating.average} readOnly size="sm" />
            <span className="text-xs text-muted-foreground">({rating.count})</span>
          </div>
        )}
      </CardContent>

      {/* Price & Action Footer */}
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              ${effectivePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${bestVariant.price.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            size="default"
            disabled={isOutOfStock || isAddingToCart}
            onClick={handleAddToCart}
            className="rounded-full px-5 py-2.5 text-xs font-semibold shadow-none active:scale-95 transition-all"
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
      </CardFooter>
    </Card>
  );
}