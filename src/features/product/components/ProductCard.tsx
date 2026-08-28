// src/features/product/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { IProduct } from "../types";
import { useCart } from "@/features/cart/context/CartProvider";
import { addToCart } from "@/features/cart/actions/add-to-cart";
import { toast } from "sonner";

// Type guard to check if category/brand is populated
function isPopulated(
  item: unknown
): item is { _id: string; name: string; slug: string } {
  return item !== null && typeof item === "object" && "name" in item;
}

type ProductCardProps = {
  product: IProduct;
  variant?: "default" | "compact" | "featured";
  showQuickView?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  variant = "default",
  showQuickView = true,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { refreshCart } = useCart();

  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];
  const hasDiscount = product.variants.some(
    (v) => v.discountPrice && v.discountPrice < v.price
  );
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const highestPrice = Math.max(...product.variants.map((v) => v.price));
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  // Safely get category and brand names
  const categoryName = isPopulated(product.categoryId) 
    ? product.categoryId.name 
    : "Category";
  
  const brandName = isPopulated(product.brandId) 
    ? product.brandId.name 
    : "Brand";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const priceDisplay = () => {
    if (lowestPrice === highestPrice) {
      return formatPrice(lowestPrice);
    }
    return `${formatPrice(lowestPrice)} - ${formatPrice(highestPrice)}`;
  };

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

  // Compact variant for smaller displays
  if (variant === "compact") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {product.name}
          </p>
          <p className="text-sm font-semibold text-primary">
            {formatPrice(lowestPrice)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30",
        isHovered && "shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <Badge className="bg-destructive/90 hover:bg-destructive/90 text-destructive-foreground border-none">
            Sale
          </Badge>
        )}
        {product.isFeatured && (
          <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
            Featured
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsWishlisted(!isWishlisted);
        }}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isWishlisted && "fill-red-500 text-red-500"
          )}
        />
      </Button>

      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  isHovered && secondaryImage && "scale-110"
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={false}
              />
              {secondaryImage && isHovered && (
                <Image
                  src={secondaryImage}
                  alt={`${product.name} - alternate view`}
                  fill
                  className="object-cover transition-opacity duration-300 opacity-100"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">No image</span>
            </div>
          )}

          {/* Quick View Overlay */}
          {showQuickView && isHovered && !isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Quick view logic here
                }}
              >
                <Eye className="h-4 w-4" />
                Quick View
              </Button>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <CardContent className="p-4 space-y-1.5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{brandName}</span>
          <span className="w-px h-3 bg-border" />
          <span>{categoryName}</span>
        </div>

        <div className="flex items-center justify-between pt-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {priceDisplay()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(highestPrice)}
              </span>
            )}
          </div>
          {!isOutOfStock && (
            <Badge variant="outline" className="text-xs">
              In Stock
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Add to Cart Button */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2 transition-all group-hover:shadow-lg group-hover:shadow-primary/20"
          disabled={isOutOfStock || isAddingToCart}
          onClick={handleAddToCart}
        >
          {isAddingToCart ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}