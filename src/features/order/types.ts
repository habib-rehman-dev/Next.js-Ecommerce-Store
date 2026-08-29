export interface IOrderItemDTO {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface IShippingAddressDTO {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IOrderDTO {
  id: string;
  items: IOrderItemDTO[];
  shippingAddress: IShippingAddressDTO;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

// Lighter shape for the /orders list — avoids shipping full item/address
// payloads for every row when only a summary is shown.
export interface IOrderListItemDTO {
  id: string;
  itemCount: number;
  firstItemName: string;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}