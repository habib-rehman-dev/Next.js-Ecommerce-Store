import "server-only";
import { getCart } from "./get-cart";
import type { ICartDTO } from "../types";

export async function getInitialCart(): Promise<ICartDTO> {
  return (await getCart()) ?? { id: "", items: [], subtotal: 0, itemCount: 0 };
}