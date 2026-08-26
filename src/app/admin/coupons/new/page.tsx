import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/features/coupon/components/CouponForm";
import { Button } from "@/components/ui/button";

export default function NewCouponPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Coupons</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Coupon</h1>
          <p className="text-sm text-muted-foreground">
            Add a new promotional coupon with discount and validity settings.
          </p>
        </div>
      </div>

      <CouponForm mode="create" />
    </div>
  );
}