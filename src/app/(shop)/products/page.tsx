// src/app/products/page.tsx (Create this if it doesn't exist)
import { getFeaturedProducts } from "@/features/product/queries/get-featured-products";
import { ProductCard } from "@/features/product/components/ProductCard";

export default async function ProductsPage() {
  const products = await getFeaturedProducts({ limit: 50, type: "newArrivals" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">All Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}