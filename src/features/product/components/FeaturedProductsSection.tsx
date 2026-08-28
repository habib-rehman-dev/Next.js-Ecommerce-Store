// src/features/product/components/FeaturedProductsSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IProduct } from "../types";
import { cn } from "@/lib/utils";

type FeaturedProductsSectionProps = {
  featuredProducts: IProduct[];
  bestSellingProducts: IProduct[];
  newArrivals: IProduct[];
  className?: string;
};

export function FeaturedProductsSection({
  featuredProducts,
  bestSellingProducts,
  newArrivals,
  className,
}: FeaturedProductsSectionProps) {
  const [activeTab, setActiveTab] = useState<"featured" | "bestSelling" | "newArrivals">(
    "featured"
  );

  const tabs = [
    {
      id: "featured",
      label: "Featured",
      icon: Sparkles,
      products: featuredProducts,
      count: featuredProducts.length,
    },
    {
      id: "bestSelling",
      label: "Best Selling",
      icon: TrendingUp,
      products: bestSellingProducts,
      count: bestSellingProducts.length,
    },
    {
      id: "newArrivals",
      label: "New Arrivals",
      icon: Clock,
      products: newArrivals,
      count: newArrivals.length,
    },
  ];

  const currentProducts =
    tabs.find((t) => t.id === activeTab)?.products || [];

  // If no products in any category, don't render
  if (tabs.every((t) => t.products.length === 0)) {
    return null;
  }

  return (
    <section className={cn("w-full py-8", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
          <div>
            <Badge variant="outline" className="mb-2">
              Products
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Our Collection
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Discover our curated selection of premium products
            </p>
          </div>
          <Button
            variant="ghost"
            className="gap-1 text-sm font-medium"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            View All Products
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as typeof activeTab)
          }
          className="w-full"
        >
          <TabsList className="mb-6 bg-muted/50 p-1 w-full sm:w-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === "featured" ? "⭐" : tab.id === "bestSelling" ? "🔥" : "🆕"}
                </span>
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 px-1.5 text-[10px] font-normal"
                >
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              {tab.products.length > 0 ? (
                <ProductGrid products={tab.products} />
              ) : (
                <EmptyState type={tab.id as typeof activeTab} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

// Product Grid Component
function ProductGrid({ products }: { products: IProduct[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

// Empty State
function EmptyState({ type }: { type: "featured" | "bestSelling" | "newArrivals" }) {
  const messages = {
    featured: "No featured products available at the moment.",
    bestSelling: "Best selling products will appear here soon.",
    newArrivals: "New arrivals will be added shortly.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        {type === "featured" && <Sparkles className="h-6 w-6 text-muted-foreground" />}
        {type === "bestSelling" && <TrendingUp className="h-6 w-6 text-muted-foreground" />}
        {type === "newArrivals" && <Clock className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium">No products yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1">
        {messages[type]}
      </p>
    </div>
  );
}