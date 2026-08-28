// src/features/product/components/CategoryBrandFilterBar.tsx
"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

type Props = {
  categories: Option[];
  brands: Option[];
};

/**
 * Pill-style filter row: "All Products | <categories> | <brands>".
 * Clicking a category sets ?categoryId=, clicking a brand sets ?brandId=.
 * Both can be active at once (e.g. "Shoes" + "Nike"), since getProducts()
 * already ANDs categoryId and brandId together.
 */
export function CategoryBrandFilterBar({ categories, brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategoryId = searchParams.get("categoryId") ?? "";
  const activeBrandId = searchParams.get("brandId") ?? "";

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function toggleCategory(id: string) {
    updateQuery({ categoryId: activeCategoryId === id ? null : id });
  }

  function toggleBrand(id: string) {
    updateQuery({ brandId: activeBrandId === id ? null : id });
  }

  function clearAll() {
    updateQuery({ categoryId: null, brandId: null });
  }

  const hasActiveFilter = Boolean(activeCategoryId || activeBrandId);

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none",
        isPending && "opacity-70"
      )}
    >
      <Pill active={!hasActiveFilter} onClick={clearAll}>
        All Products
      </Pill>

      {categories.map((c) => (
        <Pill
          key={c.id}
          active={activeCategoryId === c.id}
          onClick={() => toggleCategory(c.id)}
        >
          {c.name}
        </Pill>
      ))}

      {categories.length > 0 && brands.length > 0 && (
        <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />
      )}

      {brands.map((b) => (
        <Pill key={b.id} active={activeBrandId === b.id} onClick={() => toggleBrand(b.id)}>
          {b.name}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}