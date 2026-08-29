import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "../types";

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  processing: "bg-blue-500/10 text-blue-600 border-blue-200",
  shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  delivered: "bg-green-500/10 text-green-600 border-green-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={`capitalize ${orderStatusStyles[status]}`}>
      {status}
    </Badge>
  );
}

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  paid: "bg-green-500/10 text-green-600 border-green-200",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-slate-500/10 text-slate-600 border-slate-200",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={`capitalize ${paymentStatusStyles[status]}`}>
      {status}
    </Badge>
  );
}