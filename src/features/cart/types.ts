export interface ICartItemDTO {
  productId: string;
  variantId: string;
  quantity: number;
  productName: string;
  productSlug: string;
  productImage?: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  discountPrice?: number;
  stock: number;
}

export interface ICartDTO {
  id: string;
  items: ICartItemDTO[];
  subtotal: number;
  itemCount: number;
}