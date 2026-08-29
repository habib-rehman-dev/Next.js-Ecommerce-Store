import { getAdminOrders } from "@/features/order/queries/get-admin-orders";
import { AdminOrdersTable } from "@/features/order/components/AdminOrdersTable";
import { ProductsPagination } from "@/app/admin/products/ProductsPagination";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ page?: string; status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || undefined;

  const { orders, pagination } = await getAdminOrders({ page, status });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage customer orders</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">{pagination.total} orders</Badge>
      </div>

      <AdminOrdersTable orders={orders} />

      {pagination.pages > 1 && (
        <div className="border-t pt-2">
          <ProductsPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
}