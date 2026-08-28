// src/app/(marketing)/(shop)/products/page.tsx
import { getProducts } from "@/features/product/queries/get-products";
import { getCategories } from "@/features/category/queries/get-categories";
import { getBrands } from "@/features/brand/queries/get-brands";
import { ProductCard } from "@/features/product/components/ProductCard";
import { CategoryBrandFilterBar } from "@/features/product/components/CategoryBrandFilterBar";
import { ProductSearchBox } from "@/features/product/components/ProductSearchBox";
import { ProductsPagination } from "@/app/admin/products/ProductsPagination";
import { Badge } from "@/components/ui/badge";
import type { ComponentProps } from "react";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    brandId?: string;
    limit?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const categoryId = params.categoryId || "";
  const brandId = params.brandId || "";
  const limit = Number(params.limit) || 12;

  const [categoriesData, brandsData, { products, pagination }] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts({
      page,
      search,
      limit,
      categoryId,
      brandId,
      status: "active",
    }),
  ]);

  const categories = categoriesData
    .filter((c) => c.status === "active")
    .map((c) => ({ id: c.id, name: c.name }));
  const brands = brandsData
    .filter((b) => b.status === "active")
    .map((b) => ({ id: b.id, name: b.name }));

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover our complete collection
          </p>
        </div>
        <ProductSearchBox defaultValue={search} />
      </div>

      {/* Category | Brand pill filters */}
      <CategoryBrandFilterBar categories={categories} brands={brands} />

      {/* Product Count */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="px-3 py-1">
          {pagination.total} product{pagination.total !== 1 ? "s" : ""}
        </Badge>
        {pagination.total > 0 && (
          <span className="text-sm text-muted-foreground">
            Showing {startRecord} - {endRecord} of {pagination.total}
          </span>
        )}
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: ComponentProps<typeof ProductCard>["product"]) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pt-4 border-t">
          <ProductsPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
}