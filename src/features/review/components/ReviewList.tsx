import { MessageSquare, ShieldCheck } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { DeleteReviewButton } from "./DeleteReviewButton";
import { Badge } from "@/components/ui/badge";
import type { IReviewDTO, IRatingSummaryDTO } from "../types";

type Props = {
  reviews: IReviewDTO[];
  summary: IRatingSummaryDTO;
};

export function ReviewList({ reviews, summary }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-1 sm:border-r sm:pr-6">
          <span className="text-4xl font-bold">{summary.average.toFixed(1)}</span>
          <RatingStars value={summary.average} readOnly size="sm" />
          <span className="text-xs text-muted-foreground">
            {summary.count} review{summary.count !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 space-y-1">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.distribution[star] ?? 0;
            const pct = summary.count > 0 ? Math.round((count / summary.count) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground">{star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No reviews yet. Be the first to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-1.5 border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RatingStars value={review.rating} readOnly size="sm" />
                    {review.isVerifiedPurchase && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-green-200 bg-green-500/10 text-[10px] text-green-600"
                      >
                        <ShieldCheck className="h-3 w-3" /> Verified Purchase
                      </Badge>
                    )}
                  </div>
                  {review.title && <p className="font-medium">{review.title}</p>}
                </div>
                {review.isOwn && <DeleteReviewButton reviewId={review.id} />}
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              <p className="text-xs text-muted-foreground">
                {review.userName} · {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}