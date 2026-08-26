import Link from "next/link";
import { Plus } from "lucide-react";
import { getBrands } from "@/features/brand/queries/get-brands";
import { Button } from "@/components/ui/button";
import { BrandTable } from "@/features/brand/components/BrandsTable";

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground">
            Manage product Brands and hierarchy for your store.
          </p>
        </div>
        <Link href="/admin/brands/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Brand
          </Button>
        </Link>
      </div>

      <BrandTable brands={brands} />
    </div>
  );
}