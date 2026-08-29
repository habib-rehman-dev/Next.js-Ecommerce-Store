import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryDTO } from "../types";
import { cn } from "@/lib/utils";

type Props = {
  categories: CategoryDTO[];
  className?: string;
};

export function CategoryGridSection({ categories, className }: Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className={cn("w-full py-4", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 mb-6 border-b">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary/20 text-primary">
                Categories
              </Badge>
              <span className="text-xs text-muted-foreground">
                {categories.length} collections
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Shop by <span className="text-primary">Category</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
              Explore our curated collections
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/products" />}
            className="gap-2 group shrink-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <span>View All</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </div>

        {/* Category Grid - FIXED LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
            >
              <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:scale-[1.02] hover:-translate-y-1 h-full">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-muted/50 to-muted">
                  {/* Image */}
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority={false}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
                      <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10" />
                      <span className="text-xs sm:text-sm">No image</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Category Info - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-white tracking-tight group-hover:underline underline-offset-4 transition-all duration-300 line-clamp-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-[90%]">
                          {category.description}
                        </p>
                      )}
                      {/* View Products Badge - Appears on hover */}
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span>Explore</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}