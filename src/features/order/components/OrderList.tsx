import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { IOrderListItemDTO } from "../types";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(price);
}

export function OrderList({ orders }: { orders: IOrderListItemDTO[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-16 text-center">
        <Package className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          You haven&apos;t placed any orders yet.
        </p>
        <Link href="/products" className="mt-1 text-sm font-medium text-primary hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.id} href={`/orders/${order.id}`}>
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {order.firstItemName}
                    {order.itemCount > 1 && ` + ${order.itemCount - 1} more`}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    Order #{order.id.slice(-8).toUpperCase()} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="hidden font-semibold sm:inline">
                  {formatPrice(order.total, order.currency)}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}