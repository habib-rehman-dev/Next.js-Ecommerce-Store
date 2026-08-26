import Link from "next/link";
import { Plus } from "lucide-react";

import {dbConnect} from "@/lib/db/dbConnect";
import { Category } from "@/models/Category";
import { getProducts } from "@/features/product/queries/get-products";
import { ProductsTable } from "@/features/product/components/ProductsTable";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsPagination } from "./ProductsPagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    limit?: string;
    categoryId?: string;
    view?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || "";
  const limit = Number(resolvedParams.limit) || 10;
  const categoryId = resolvedParams.categoryId || "";
  const view = resolvedParams.view || "table";

  await dbConnect();

  // Fetch products and active categories concurrently
  const [{ products, pagination }, categoriesData] = await Promise.all([
    getProducts({
      page,
      search,
      limit,
      categoryId,
    }),
    Category.find({ status: "active" }).select("_id name").lean(),
  ]);

  const categories = categoriesData.map((c: { _id: { toString: () => string }; name: string }) => ({
    _id: c._id.toString(),
    name: c.name,
  }));

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your store catalog and inventory variants
          </p>
        </div>
        <Button  className="shadow-lg  shadow-primary/20">
          <Link className="flex justify-center items-center" href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> 
            Add Product
          </Link>
        </Button>
      </div>

      {/* Dynamic Filters */}
      <ProductsFilters
        search={search}
        limit={limit}
        categoryId={categoryId}
        view={view}
        categories={categories}
      />

      {/* Catalog Stats */}
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

      {/* Products Table or Grid View */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-card">
        <ProductsTable products={products} />
        
        {/* Pagination Bar */}
        <ProductsPagination pagination={pagination} />
      </div>
    </div>
  );
}