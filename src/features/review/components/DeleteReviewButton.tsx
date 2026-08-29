"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteReview } from "../actions/delete-review";
import { Button } from "@/components/ui/button";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this review? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (!result.success) toast.error(result.message);
      else toast.success(result.message ?? "Review deleted");
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleDelete}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}