import Link from "next/link";
import { Plus } from "lucide-react";

import { getCoupons } from "@/features/coupon/queries/get-coupons";
import { CouponsTable } from "@/features/coupon/components/CouponsTable";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function CouponsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || "";

  const { coupons } = await getCoupons({ page, search });

  return (
    <div className="p-6 space-y-6 max-w-300 mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Manage promotional codes and discount offers
          </p>
        </div>
        <Button className="shadow-lg  shadow-primary/20">
          <Link
            className="flex justify-center items-center"
            href="/admin/coupons/new"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <CouponsTable coupons={coupons} />
    </div>
  );
}
