import { getAdminReviews } from "@/features/review/actions/get-admin-reviews";
import { AdminReviewsTable } from "@/features/review/components/AdminReviewsTable";
import { ProductsPagination } from "@/app/admin/products/ProductsPagination";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { reviews, pagination } = await getAdminReviews({ page });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="text-sm text-muted-foreground">Moderate customer product reviews</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">{pagination.total} reviews</Badge>
      </div>

      <AdminReviewsTable reviews={reviews} />

      {pagination.pages > 1 && (
        <div className="border-t pt-2">
          <ProductsPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
}