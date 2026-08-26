import { notFound } from "next/navigation";
import {dbConnect} from "@/lib/db/dbConnect";
import { Coupon } from "@/models/Coupon";
import { CouponForm } from "@/features/coupon/components/CouponForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  await dbConnect();

  const couponDoc = await Coupon.findById(id).lean();
  if (!couponDoc) {
    notFound();
  }

  const coupon = {
    _id: (couponDoc._id).toString(),
    code: couponDoc.code,
    discountType: couponDoc.discountType,
    discountValue: couponDoc.discountValue,
    minOrderValue: couponDoc.minOrderValue,
    maxUses: couponDoc.maxUses,
    usedCount: couponDoc.usedCount,
    expiresAt: couponDoc.expiresAt ? couponDoc.expiresAt.toISOString() : undefined,
    status: couponDoc.status,
    createdAt: couponDoc.createdAt.toISOString(),
    updatedAt: couponDoc.updatedAt.toISOString(),
  };

  return (
    <div className="  gap-4  flex  justify- flex-col border ">
          <h1 className="text-2xl font-semibold text-start  w-full">Edit coupen</h1>
          
       
   
      <CouponForm mode="edit" coupon={coupon} />
    </div>
  );
}