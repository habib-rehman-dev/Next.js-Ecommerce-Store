'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ticket, Loader2 } from "lucide-react";

import { couponSchema, CouponFormInput } from "../validation";
import { CouponSerialized } from "../types";
import { createCoupon } from "../actions/create-coupon";
import { updateCoupon } from "../actions/update-coupon";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  mode: "create" | "edit";
  coupon?: CouponSerialized;
};

export function CouponForm({ mode, coupon }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultExpiresAt = coupon?.expiresAt
    ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
    : "";

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.input<typeof couponSchema>, object, CouponFormInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || "",
      discountType: "percentage",
      discountValue: coupon?.discountValue || 10,
      minOrderValue: coupon?.minOrderValue || undefined,
      maxUses: coupon?.maxUses || undefined,
      expiresAt: defaultExpiresAt,
      status: coupon?.status || "active",
    },
  });

  const status = useWatch({ control, name: "status" });

  const onSubmit = async (data: CouponFormInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const res =
      mode === "create"
        ? await createCoupon(data)
        : await updateCoupon(coupon!._id, data);

    setIsSubmitting(false);

    if (res.success) {
      router.push("/admin/coupons");
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          {mode === "create" ? "Create New Coupon" : `Edit Coupon: ${coupon?.code}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                placeholder="e.g. SUMMER2026"
                {...register("code")}
                className="uppercase"
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* Discount Value (%) */}
            <div className="space-y-1.5">
              <Label htmlFor="discountValue">Discount Percentage (%)</Label>
              <Input
                id="discountValue"
                type="number"
                min="1"
                max="100"
                placeholder="10"
                {...register("discountValue")}
              />
              {errors.discountValue && (
                <p className="text-xs text-destructive">{errors.discountValue.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Minimum Order Value */}
            <div className="space-y-1.5">
              <Label htmlFor="minOrderValue">Min Order Value ($) [Optional]</Label>
              <Input
                id="minOrderValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("minOrderValue")}
              />
              {errors.minOrderValue && (
                <p className="text-xs text-destructive">{errors.minOrderValue.message}</p>
              )}
            </div>

            {/* Max Usage Limit */}
            <div className="space-y-1.5">
              <Label htmlFor="maxUses">Max Uses [Optional]</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="e.g. 100"
                {...register("maxUses")}
              />
              {errors.maxUses && (
                <p className="text-xs text-destructive">{errors.maxUses.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expiration Date */}
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Expiration Date [Optional]</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register("expiresAt")}
              />
              {errors.expiresAt && (
                <p className="text-xs text-destructive">{errors.expiresAt.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(val) => {
                  if (val) setValue("status", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/coupons")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Coupon" : "Update Coupon"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}