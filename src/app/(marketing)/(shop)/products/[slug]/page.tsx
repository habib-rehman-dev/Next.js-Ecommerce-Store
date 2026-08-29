import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getProductBySlug } from "@/features/product/queries/get-product-by-slug";
import { getRelatedProducts } from "@/features/product/queries/get-related-products";
import { ProductDetailView } from "@/features/product/components/ProductDetailView";
import { ProductCard } from "@/features/product/components/ProductCard";
import { getRatingSummary } from "@/features/review/queries/get-rating-summary";
import { getRatingSummaries } from "@/features/review/queries/get-rating-summaries";
import { ProductReviewsSection } from "@/features/review/components/ProductReviewsSection";


type Props = { params: Promise<{ slug: string }> };

function isPopulated(item: unknown): item is { _id: string; name: string; slug: string } {
  return item !== null && typeof item === "object" && "name" in item;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const categoryId = isPopulated(product.categoryId) ? product.categoryId._id : String(product.categoryId);
  const categoryName = isPopulated(product.categoryId) ? product.categoryId.name : null;
//   const brandId = isPopulated(product.brandId) ? product.brandId._id : String(product.brandId);

  const related = await getRelatedProducts(categoryId, product._id, 4);
  const [ratingSummary, relatedRatings] = await Promise.all([
    getRatingSummary(product._id),
    getRatingSummaries(related.map((p) => p._id)),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground transition-colors">
          Products
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/products?categoryId=${categoryId}`} className="hover:text-foreground transition-colors">
              {categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

 
<ProductDetailView product={product} ratingSummary={ratingSummary} />

      <ProductReviewsSection productId={product._id} />
      {related.length > 0 && (
        <section className="space-y-6 border-t pt-8">
          <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} rating={relatedRatings[p._id]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description ?? `Shop ${product.name}`,
  };
}