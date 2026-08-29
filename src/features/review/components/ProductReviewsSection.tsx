import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getReviews } from "../queries/get-reviews";
import { getUserReviewForProduct } from "../queries/get-user-review";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

export async function ProductReviewsSection({ productId }: { productId: string }) {
  const { userId } = await auth();

  const [{ reviews, summary }, existingReview] = await Promise.all([
    getReviews({ productId, limit: 10 }),
    userId ? getUserReviewForProduct(productId) : Promise.resolve(null),
  ]);

  return (
    <section className="space-y-6 border-t pt-8">
      <h2 className="text-2xl font-bold tracking-tight">Ratings & Reviews</h2>

      {userId && !existingReview && <ReviewForm productId={productId} />}
      {userId && existingReview && (
        <p className="text-sm text-muted-foreground">
          You&apos;ve already reviewed this product. Thanks for your feedback!
        </p>
      )}
      {!userId && (
        <p className="text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      )}

      <ReviewList reviews={reviews} summary={summary} />
    </section>
  );
}