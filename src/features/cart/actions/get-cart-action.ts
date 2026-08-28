"use server";

import { getCart } from "../queries/get-cart";
import type { ICartDTO } from "../types";

export async function getCartAction(): Promise<ICartDTO | null> {
  return getCart();
}