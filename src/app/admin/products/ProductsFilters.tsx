'use client';

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, Grid3x3, List } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CategoryOption = {
  _id: string;
  name: string;
};

type Props = {
  search: string;
  limit: number;
  categoryId: string;
  view: string;
  categories: CategoryOption[];
};

export function ProductsFilters({
  search,
  limit,
  categoryId,
  view,
  categories,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset page to 1 on filter/search change
    if (!updates.hasOwnProperty("page")) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Card aria-busy={isPending}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input - Controlled */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or SKUs..."
              className="pl-9"
              value={search || ""}
              disabled={isPending}
              onChange={(e) => {
                const val = e.target.value;
                updateQuery({ search: val });
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dynamic Category Selector */}
            <Select
              value={categoryId || "all"}
              disabled={isPending}
              onValueChange={(val) => updateQuery({ categoryId: val })}
            >
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Per Page Limit Selector */}
            <Select
              value={String(limit)}
              disabled={isPending}
              onValueChange={(val) => updateQuery({ limit: val })}
            >
              <SelectTrigger className="w-27">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>

            {/* Layout View Switcher */}
            <Tabs
              value={view}
              onValueChange={(val) => updateQuery({ view: val })}
              className="hidden sm:block"
            >
              <TabsList>
                <TabsTrigger value="table" className="px-3" disabled={isPending}>
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="grid" className="px-3" disabled={isPending}>
                  <Grid3x3 className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}