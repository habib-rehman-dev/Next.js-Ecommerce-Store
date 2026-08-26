// src/app/(marketing)/page.tsx
import { getActiveHeroBanners } from "@/features/hero/queries/get-hero-banners";
import { HeroBannerSection } from "@/features/hero/components/HeroBannerSection";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const banners = await getActiveHeroBanners();
  const primaryBanner = banners[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {primaryBanner && <HeroBannerSection banner={primaryBanner} />}
    </main>
  );
}