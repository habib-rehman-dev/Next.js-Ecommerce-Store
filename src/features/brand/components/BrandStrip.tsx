// src/features/brand/components/BrandStrip.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";

import type { BrandDTO } from "../types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useRef, useState, useEffect } from "react";

type BrandStripProps = {
  brands: BrandDTO[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  className?: string;
};

export function BrandStrip({
  brands,
  title = "Shop by Brand",
  subtitle = "Discover products from your favorite brands",
  showViewAll = true,
  className,
}: BrandStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    const target =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Mouse drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollRef.current;
    if (container) container.style.cursor = "grab";
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full py-8", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <Badge variant="outline" className="mb-2">
              Brands
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {showViewAll && brands.length > 6 && (
            <Button
              variant="ghost"
              className="gap-1 text-sm font-medium"
              nativeButton={false}
              render={<Link href="/brands" />}
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Brand Strip Container */}
        <div className="relative group">
          {/* Left Scroll Button */}
          {showLeftArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg border-border hover:bg-background transition-all duration-200 hidden md:flex"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Scrollable Brand Cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-4 px-1 cursor-grab"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}

            {/* Empty state filler for smooth scrolling */}
            {brands.length > 6 && (
              <div className="min-w-[1px] flex-shrink-0" aria-hidden="true" />
            )}
          </div>

          {/* Right Scroll Button */}
          {showRightArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg border-border hover:bg-background transition-all duration-200 hidden md:flex"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile indicator */}
        <div className="flex justify-center gap-1 mt-4 md:hidden">
          {brands.slice(0, 6).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 w-6 rounded-full transition-all duration-300",
                i === 0 ? "bg-primary w-8" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Brand Card Component
function BrandCard({ brand }: { brand: BrandDTO }) {
  return (
    <Link
      href={`/products?brandId=${brand.id}`}
      className="group flex-shrink-0 snap-start w-28 sm:w-36 md:w-40 lg:w-44"
    >
      <Card className="h-full border hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm hover:bg-card">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full gap-3">
          {/* Brand Logo */}
          <div className="relative w-full aspect-square max-h-16 md:max-h-20 flex items-center justify-center p-2 bg-muted/30 rounded-lg group-hover:bg-muted/50 transition-colors">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
            )}
          </div>

          {/* Brand Name */}
          <div className="text-center w-full">
            <p className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2">
              {brand.name}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}