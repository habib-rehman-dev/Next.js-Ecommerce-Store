// src/app/admin/hero-banners/page.tsx
import { dbConnect } from "@/lib/db/dbConnect";
import { HeroBanner } from "@/models/HeroBanner";
import { HeroBannerTable } from "@/features/hero/components/HeroBannerTable";

export const dynamic = "force-dynamic";

export default async function AdminHeroBannersPage() {
  await dbConnect();
  const rawBanners = await HeroBanner.find({}).sort({ createdAt: -1 }).lean();
  const banners = JSON.parse(JSON.stringify(rawBanners));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <HeroBannerTable banners={banners} />
    </div>
  );
}