export type CouponSerialized = {
  _id: string;
  code: string;
  discountType: "percentage";
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};