'use client';

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Loader2, AlertCircle } from "lucide-react";

import { CouponSerialized } from "../types";
import { deleteCoupon } from "../actions/delete-coupon";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  coupons: CouponSerialized[];
};

export function CouponsTable({ coupons }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    setDeletingId(id);
    await deleteCoupon(id);
    setDeletingId(null);
  };

  if (coupons.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md bg-muted/10">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No coupons found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Min Order</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => {
            const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

            return (
              <TableRow key={coupon._id}>
                <TableCell className="font-mono font-bold tracking-wide">
                  {coupon.code}
                </TableCell>
                <TableCell>{coupon.discountValue}% OFF</TableCell>
                <TableCell>
                  {coupon.minOrderValue ? `$${coupon.minOrderValue.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell>
                  {coupon.usedCount} / {coupon.maxUses ?? "∞"}
                </TableCell>
                <TableCell>
                  {coupon.expiresAt ? (
                    <span className={isExpired ? "text-destructive font-semibold" : ""}>
                      {new Date(coupon.expiresAt).toLocaleDateString()}
                    </span>
                  ) : (
                    "Never"
                  )}
                </TableCell>
                <TableCell>
                  {isExpired ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : coupon.status === "active" ? (
                    <Badge variant="default" className="bg-emerald-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" >
                    <Link href={`/admin/coupons/${coupon._id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(coupon._id, coupon.code)}
                    disabled={deletingId === coupon._id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingId === coupon._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}