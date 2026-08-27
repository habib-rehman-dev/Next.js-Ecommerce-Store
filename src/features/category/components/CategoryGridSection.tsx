import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryDTO } from "../types";

type Props = {
  categories: CategoryDTO[];
};

export function CategoryGridSection({ categories }: Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <Badge variant="outline" className="mb-2">
            Categories
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Shop by Category
          </h2>
        </div>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/products" />}
          className="gap-1 text-sm font-medium"
        >
          View All <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?categoryId=${category.id}`}
            className="group block focus:outline-none"
          >
            <Card className="overflow-hidden border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <CardContent className="p-0">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold text-base sm:text-lg tracking-tight group-hover:underline underline-offset-4">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}