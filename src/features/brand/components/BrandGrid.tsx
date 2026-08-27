// src/features/brand/components/BrandGrid.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BrandDTO } from "../types";

type BrandGridProps = {
  brands: BrandDTO[];
  showCount?: boolean;
};

export function BrandGrid({ brands, showCount = true }: BrandGridProps) {
  if (!brands || brands.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No brands available</h3>
        <p className="text-sm text-muted-foreground">Check back later for new brands.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCount && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{brands.length}</span> brands
          </p>
          <Badge variant="outline" className="text-xs">
            {brands.length} total
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </div>
  );
}

// Individual Brand Card
function BrandCard({ brand }: { brand: BrandDTO }) {
  return (
    <Link
      href={`/products?brandId=${brand.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="h-full border hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm hover:bg-card">
        <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div className="relative w-full aspect-square max-h-20 sm:max-h-24 md:max-h-28 flex items-center justify-center p-3 bg-muted/30 rounded-lg group-hover:bg-muted/50 transition-colors">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
                loading="lazy"
              />
            ) : (
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
            )}
          </div>

          {/* Brand Name */}
          <div className="text-center w-full">
            <p className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2">
              {brand.name}
            </p>
            {brand.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1 hidden sm:block">
                {brand.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}