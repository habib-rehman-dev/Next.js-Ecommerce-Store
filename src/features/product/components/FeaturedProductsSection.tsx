// src/features/product/components/FeaturedProductsSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  TrendingUp, 
  Clock,
  ArrowUpRight 
} from "lucide-react";
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
      color: "text-yellow-500",
    },
    {
      id: "bestSelling",
      label: "Best Selling",
      icon: TrendingUp,
      products: bestSellingProducts,
      count: bestSellingProducts.length,
      color: "text-green-500",
    },
    {
      id: "newArrivals",
      label: "New Arrivals",
      icon: Clock,
      products: newArrivals,
      count: newArrivals.length,
      color: "text-blue-500",
    },
  ];

  const activeTabData = tabs.find((t) => t.id === activeTab);

  // If no products in any category, don't render
  if (tabs.every((t) => t.products.length === 0)) {
    return null;
  }

  return (
    <section className={cn("w-full py-12", className)}>
      <div className="max-w-7xl  mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
        
        {/* 1. TOP: Main Header Section */}
        <div className="flex flex-col  items-start gap-2 mb-8">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className="px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary/20 text-primary"
            >
              Curated For You
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {activeTabData?.count || 0} items available
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Our <span className="text-primary">Collection</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Discover our carefully curated selection of premium products, designed to elevate your everyday experience.
          </p>
        </div>

        {/* Tabs Root */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="w-full flex flex-col"
        >
          <div className="flex flex-col  gap-4 pb-4 border-b mb-8 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="h-auto w-full p-1 bg-muted/50 rounded-full sm:w-auto overflow-x-auto flex justify-start">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 shrink-0",
                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                    "hover:bg-background/50",
                    "text-sm font-medium"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", tab.color)} />
                  <span>{tab.label}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-1 h-5 px-2 text-[10px] font-normal",
                      "transition-all duration-300",
                      activeTab === tab.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/products" />}
              className="hidden sm:flex gap-2 group shrink-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <span>View All</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>

          <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
            {activeTabData && activeTabData.products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {activeTabData.products.map((product, index) => (
                    <div
                      key={product._id}
                      className="h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} className="h-full" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/products" />}
                    className="w-full gap-2 text-sm"
                  >
                    View All Products <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState type={activeTab} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// Empty State Component
function EmptyState({ type }: { type: "featured" | "bestSelling" | "newArrivals" }) {
  const messages = {
    featured: {
      title: "No featured products yet",
      description: "Check back soon for our curated selection of featured items.",
      icon: Sparkles,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    bestSelling: {
      title: "No best sellers yet",
      description: "Our top-selling products will be displayed here soon.",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    newArrivals: {
      title: "No new arrivals yet",
      description: "We're adding fresh products regularly. Check back soon!",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  };

  const data = messages[type];
  const Icon = data.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-2xl bg-muted/20">
      <div className={cn("rounded-full p-4 mb-4", data.bgColor)}>
        <Icon className={cn("h-8 w-8", data.color)} />
      </div>
      <h3 className="text-lg font-semibold">{data.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1">
        {data.description}
      </p>
      <Button
        variant="outline"
        className="mt-4 gap-2"
        nativeButton={false}
        render={<Link href="/products" />}
      >
        Browse All Products
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </div>
  );
}