"use client";

import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";


import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "./ProductGallery";
import type { IProduct, IProductVariant } from "../types";

function isPopulated(item: unknown): item is { _id: string; name: string; slug: string } {
  return item !== null && typeof item === "object" && "name" in item;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

type Props = { product: IProduct };

export function ProductDetailView({ product }: Props) {
  const categoryName = isPopulated(product.categoryId) ? product.categoryId.name : "Category";
  const brandName = isPopulated(product.brandId) ? product.brandId.name : "Brand";

  // Attribute keys present across variants (e.g. "color", "size")
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    product.variants.forEach((v) => Object.keys(v.attributes || {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [product.variants]);

  const attributeOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    attributeKeys.forEach((key) => {
      const values = new Set<string>();
      product.variants.forEach((v) => {
        if (v.attributes?.[key]) values.add(v.attributes[key]);
      });
      map[key] = Array.from(values);
    });
    return map;
  }, [attributeKeys, product.variants]);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    attributeKeys.forEach((key) => {
      const firstValue = product.variants.find((v) => v.attributes?.[key])?.attributes[key];
      if (firstValue) initial[key] = firstValue;
    });
    return initial;
  });

  const selectedVariant: IProductVariant | undefined = useMemo(() => {
    if (attributeKeys.length === 0) return product.variants[0];
    return product.variants.find((v) =>
      attributeKeys.every((key) => v.attributes?.[key] === selectedAttributes[key])
    );
  }, [attributeKeys, product.variants, selectedAttributes]);

  const [quantity, setQuantity] = useState(1);

  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const maxQty = selectedVariant?.stock ?? 1;
  const hasDiscount =
    selectedVariant?.discountPrice != null && selectedVariant.discountPrice < selectedVariant.price;

  const images = selectedVariant?.images?.length ? selectedVariant.images : product.images;



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <ProductGallery images={images} productName={product.name} />

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{brandName}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{categoryName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{product.name}</h1>
        </div>

        <div className="flex items-baseline gap-3">
          {selectedVariant && (
            <>
              <span className="text-3xl font-bold text-primary">
                {formatPrice(hasDiscount ? selectedVariant.discountPrice! : selectedVariant.price)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(selectedVariant.price)}
                </span>
              )}
            </>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        )}

        <Separator />

        {/* Variant attribute pickers */}
        {attributeKeys.map((key) => (
          <div key={key} className="space-y-2">
            <span className="text-sm font-medium capitalize">{key}</span>
            <div className="flex flex-wrap gap-2">
              {attributeOptions[key].map((value) => {
                const isSelected = selectedAttributes[key] === value;
                const wouldMatch = product.variants.some((v) =>
                  attributeKeys.every((k) =>
                    k === key ? v.attributes?.[k] === value : v.attributes?.[k] === selectedAttributes[k]
                  )
                );
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!wouldMatch}
                    onClick={() => setSelectedAttributes((prev) => ({ ...prev, [key]: value }))}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Stock badge */}
        <div>
          {!selectedVariant ? (
            <Badge variant="outline">Select options</Badge>
          ) : inStock ? (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-500/10">
              In Stock ({selectedVariant.stock} available)
            </Badge>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>

        {/* Quantity + Add to cart */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={!inStock}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={!inStock}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

         <AddToCartButton
            productId={product._id}
            variantId={selectedVariant?._id ?? ""}
            quantity={quantity}
            disabled={!inStock || !selectedVariant}
          />
        </div>

        {selectedVariant?.sku && (
          <p className="text-xs text-muted-foreground">SKU: {selectedVariant.sku}</p>
        )}
      </div>
    </div>
  );
}