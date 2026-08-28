import "server-only";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db/dbConnect";
import { Cart, type ICartItem } from "@/models/Cart";
import { Product } from "@/models/Product";
import type { ICartDTO, ICartItemDTO } from "../types";

export async function getCart(): Promise<ICartDTO | null> {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();

  const cart = await Cart.findOne({ userId }).lean();
  if (!cart || cart.items.length === 0) {
    return { id: cart?._id?.toString() ?? "", items: [], subtotal: 0, itemCount: 0 };
  }

  const cartItems = cart.items as ICartItem[];
  const productIds = [...new Set(cartItems.map((item: ICartItem) => item.productId.toString()))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const items: ICartItemDTO[] = [];
  for (const item of cartItems) {
    const product = productMap.get(item.productId.toString());
    if (!product) continue; // product deleted after being added to cart

    const variant = product.variants.find(
      (v: { _id?: { toString(): string } }) => v._id?.toString() === item.variantId.toString()
    );
    if (!variant) continue; // variant removed after being added to cart

    items.push({
      productId: item.productId.toString(),
      variantId: item.variantId.toString(),
      quantity: item.quantity,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0],
      sku: variant.sku,
      attributes: variant.attributes ?? {},
      price: variant.price,
      discountPrice: variant.discountPrice,
      stock: variant.stock,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { id: cart._id.toString(), items, subtotal, itemCount };
}