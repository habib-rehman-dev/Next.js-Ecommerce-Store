// src/features/brand/components/BrandSearch.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BrandDTO } from "../types";

type BrandSearchProps = {
  brands: BrandDTO[];
};

export function BrandSearch({ brands }: BrandSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return brands
      .filter((brand) => 
        brand.name.toLowerCase().includes(query) ||
        brand.description?.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [brands, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search brands..."
          className="pl-9 pr-8 w-full sm:w-64"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && filteredBrands.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg p-2 z-50 max-h-80 overflow-y-auto">
          {filteredBrands.map((brand) => (
            <a
              key={brand.id}
              href={`/products?brandId=${brand.id}`}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => clearSearch()}
            >
              {brand.logo ? (
                <div className="relative h-8 w-8 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 shrink-0 bg-muted rounded-md flex items-center justify-center">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{brand.name}</p>
                {brand.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {brand.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                View
              </Badge>
            </a>
          ))}
        </div>
      )}

      {showResults && searchQuery && filteredBrands.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg p-4 z-50 text-center">
          <p className="text-sm text-muted-foreground">
            No brands found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
}