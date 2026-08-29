"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "../actions/update-order-status";
import type { OrderStatus } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value || value === status) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (!result.success) toast.error(result.message);
      else toast.success(result.message ?? "Status updated");
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}