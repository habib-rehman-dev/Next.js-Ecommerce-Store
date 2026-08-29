import { Package, Truck, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import type { IOrderDTO } from "../types";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(price);
}

export function OrderDetail({ order }: { order: IOrderDTO }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Package className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Truck className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Payment</p>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku} × {item.quantity}
                    </p>
                    {Object.keys(item.attributes || {}).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.lineTotal, order.currency)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingFee || 0, order.currency)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount, order.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
              {order.couponCode && (
                <Badge variant="secondary" className="w-full justify-center">
                  Coupon: {order.couponCode}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5 text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && (
                  <>, {order.shippingAddress.addressLine2}</>
                )}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              <p className="pt-1 text-muted-foreground">{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}