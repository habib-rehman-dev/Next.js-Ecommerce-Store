// src/features/product/components/ProductQuickView.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IProduct } from "../types";
import { ProductCard } from "./ProductCard";

type ProductQuickViewProps = {
  product: IProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick View</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.description || "No description available"}
              </p>
            </div>
            <div className="space-y-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.sku}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{variant.sku}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {variant.stock}
                    </p>
                  </div>
                  <p className="font-bold text-primary">
                    ${variant.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}