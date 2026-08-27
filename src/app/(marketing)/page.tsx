import { getActiveHeroBanners } from "@/features/hero/queries/get-hero-banners";
import { HeroBannerSection } from "@/features/hero/components/HeroBannerSection";
import { getFeaturedCategories } from "@/features/category/queries/get-featured-categories";
import { CategoryGridSection } from "@/features/category/components/CategoryGridSection";

export default async function MarketingPage() {
  const [banners, categories] = await Promise.all([
    getActiveHeroBanners(),
    getFeaturedCategories(),
  ]);

  const primaryBanner = banners[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {primaryBanner && <HeroBannerSection banner={primaryBanner} />}
      <CategoryGridSection categories={categories} />
    </main>
  );
}