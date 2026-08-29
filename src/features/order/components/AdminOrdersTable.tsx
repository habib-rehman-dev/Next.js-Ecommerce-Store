import Link from "next/link";
import { PaymentStatusBadge } from "./OrderStatusBadge";
import { OrderStatusSelect } from "./OrderStatusSelect";
import type { IOrderListItemDTO } from "../types";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(price);
}

type Row = IOrderListItemDTO & { userId: string };

export function AdminOrdersTable({ orders }: { orders: Row[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{o.userId.slice(-10)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{o.itemCount} item{o.itemCount !== 1 ? "s" : ""}</Badge>
              </TableCell>
              <TableCell className="font-semibold">{formatPrice(o.total, o.currency)}</TableCell>
              <TableCell><PaymentStatusBadge status={o.paymentStatus} /></TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell><OrderStatusSelect orderId={o.id} status={o.status} /></TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium text-primary hover:underline">
                  Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}