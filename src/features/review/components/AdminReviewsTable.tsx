"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { deleteReview } from "../actions/delete-review";
import { RatingStars } from "./RatingStars";
import type { AdminReviewRow } from "../actions/get-admin-reviews";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminReviewsTable({ reviews }: { reviews: AdminReviewRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (!confirm("Delete this review? This can't be undone.")) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteReview(id);
      setPendingId(null);
      if (!result.success) toast.error(result.message);
      else toast.success("Review deleted");
    });
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.productName}</TableCell>
              <TableCell className="text-sm">
                {r.userName}
                {r.isVerifiedPurchase && (
                  <ShieldCheck className="ml-1 inline h-3.5 w-3.5 text-green-600" />
                )}
              </TableCell>
              <TableCell><RatingStars value={r.rating} readOnly size="sm" /></TableCell>
              <TableCell className="max-w-xs">
                {r.title && <p className="text-xs font-medium">{r.title}</p>}
                <p className="line-clamp-2 text-xs text-muted-foreground">{r.comment}</p>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/products/${r.productId}`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    View product
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending && pendingId === r.id}
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}