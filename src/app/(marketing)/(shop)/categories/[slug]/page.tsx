// src/app/(marketing)/(shop)/categories/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";

import { getCategoryById } from "@/features/category/queries/get-category-by-id";
import { getProducts } from "@/features/product/queries/get-products";
import { ProductCard } from "@/features/product/components/ProductCard";
import { ProductsPagination } from "@/app/admin/products/ProductsPagination";
import { getRatingSummaries } from "@/features/review/queries/get-rating-summaries";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam = "1", sort = "newest" } = await searchParams;
  
  const page = Number(pageParam) || 1;
  const limit = 12;

  // Fetch category and products in parallel
  const category = await getCategoryById(slug);
  
  if (!category) {
    notFound();
  }

  // Build sort options
  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price-asc") sortOption = { "variants.price": 1 };
  else if (sort === "price-desc") sortOption = { "variants.price": -1 };
  else if (sort === "name") sortOption = { name: 1 };
  else if (sort === "newest") sortOption = { createdAt: -1 };

  // Fetch products for this category (only active products)
  const { products, pagination } = await getProducts({
    page,
    limit,
    categoryId: category.id,
    status: "active",
  });

  // Get ratings for all products in one efficient query
  const productIds = products.map((p: any) => p._id);
  const ratingsMap = await getRatingSummaries(productIds);

  // Build the page title and description for metadata
  const pageTitle = category.name;
  const pageDescription = category.description || `Browse ${category.name} products in our store`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground transition-colors">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Category Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border p-8 sm:p-12">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" className="mb-3 text-xs font-semibold uppercase tracking-wider border-primary/20 text-primary">
            Category
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-lg text-muted-foreground max-w-xl">
              {category.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {pagination.total} product{pagination.total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Decorative image if available */}
        {category.image && (
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{products.length}</span> of{" "}
          <span className="font-medium text-foreground">{pagination.total}</span> products
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            defaultValue={sort}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("sort", e.target.value);
              url.searchParams.delete("page");
              window.location.href = url.toString();
            }}
          >
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-medium">No products in this category</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Check back soon for new arrivals in {category.name}.
          </p>
          <Link
            href="/products"
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: any) => (
            <ProductCard
              key={product._id}
              product={product}
              rating={ratingsMap[product._id]}
            />
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

// Generate metadata dynamically
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryById(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "This category does not exist.",
    };
  }

  return {
    title: `${category.name} - Category`,
    description: category.description || `Browse our collection of ${category.name} products.`,
  };
}