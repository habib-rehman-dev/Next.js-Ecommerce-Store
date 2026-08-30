// src/app/(marketing)/page.tsx
import { getActiveHeroBanners } from "@/features/hero/queries/get-hero-banners";
import { HeroBannerSection } from "@/features/hero/components/HeroBannerSection";
import { getFeaturedCategories } from "@/features/category/queries/get-featured-categories";
import { CategoryGridSection } from "@/features/category/components/CategoryGridSection";
import { getActiveBrands } from "@/features/brand/queries/get-active-brands";
import { BrandStrip } from "@/features/brand/components/BrandStrip";
import { getFeaturedProducts } from "@/features/product/queries/get-featured-products";
import { FeaturedProductsSection } from "@/features/product/components/FeaturedProductsSection";
import { NewsletterSection } from "@/features/newsletter/components/NewsletterSection";
import { TrustSignals } from "@/features/trust/components/TrustSignals";
import { Suspense } from "react";
import type { Metadata } from "next";
import { MarketingPageSkeleton } from "../components/skeletons/MarketingPageSkeleton";

// ... inside MarketingPage return:

export const metadata: Metadata = {
  title: "Ecomora | Shop the Best Products Online",
  description: "Discover top-quality products, amazing deals, and industry-leading brands at your favorite online store.",
  openGraph: {
    title: "Ecomora | Shop the Best Products Online",
    description: "Discover top-quality products, amazing deals, and industry-leading brands.",
    images: [{ url: "/images/og-homepage.jpg" }],
  }, 
};

export default async function MarketingPage() {
  const [banners, categories, brands, featuredProducts, bestSellingProducts, newArrivals] =
    await Promise.all([
      getActiveHeroBanners(),
      getFeaturedCategories(),
      getActiveBrands(12),
      getFeaturedProducts({ limit: 8, type: "featured" }),
      getFeaturedProducts({ limit: 8, type: "bestSelling" }),
      getFeaturedProducts({ limit: 8, type: "newArrivals" }),
    ]);

  const primaryBanner = banners[0];

  return (
      <Suspense fallback={<MarketingPageSkeleton />}>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Hero Banner */}
      {primaryBanner && <HeroBannerSection banner={primaryBanner} />}

      {/* Trust Signals - NEW */}
      <TrustSignals variant="row" />

      {/* Category Grid */}
      <CategoryGridSection categories={categories} />

      {/* Featured Products Section */}
      <FeaturedProductsSection
        featuredProducts={featuredProducts}
        bestSellingProducts={bestSellingProducts}
        newArrivals={newArrivals}
      />

      {/* Brand Strip */}
      <BrandStrip
        brands={brands}
        title="Trusted Brands"
        subtitle="Shop from industry-leading brands you know and love"
      />

      {/* Newsletter Section - NEW */}
      <NewsletterSection source="homepage" />
    </main>
    </Suspense>
  );
}