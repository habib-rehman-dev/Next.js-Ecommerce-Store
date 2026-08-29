import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { getOrders } from "@/features/order/queries/get-orders";
import { OrderList } from "@/features/order/components/OrderList";
import { ProductsPagination } from "@/app/admin/products/ProductsPagination";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const { orders, pagination } = await getOrders({ page, limit: 10 });

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Your Orders</h1>
          <p className="text-sm text-muted-foreground">
            {pagination.total} order{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <OrderList orders={orders} />

      {pagination.pages > 1 && (
        <div className="border-t pt-2">
          <ProductsPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
}