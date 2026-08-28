import "server-only";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db/dbConnect";
import { Cart, type ICartItem } from "@/models/Cart";

export async function getCartItemCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;

  await dbConnect();
  const cart = (await Cart.findOne({ userId }).select("items").lean()) as {
    items: ICartItem[];
  } | null;
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}