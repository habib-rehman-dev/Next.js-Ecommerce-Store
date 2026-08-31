import "server-only";
import {dbConnect} from "@/lib/db/dbConnect";
import { Coupon } from "@/models/Coupon";
import { CouponSerialized } from "../types";

type GetCouponsOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getCoupons({
  page = 1,
  limit = 10,
  search = "",
}: GetCouponsOptions = {}) {
  await dbConnect();

  const query: { code?: { $regex: string; $options: "i" } } = {};
  if (search) {
    query.code = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [rawCoupons, total] = await Promise.all([
    Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(query),
  ]);

  const coupons: CouponSerialized[] = rawCoupons.map((c) => ({
    _id: c._id.toString(),
    code: c.code,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderValue: c.minOrderValue,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : undefined,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return {
    coupons,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}