"use client";

import { createContext, useCallback, useContext, useState, useTransition } from "react";
import type { ICartDTO } from "../types";
import { getCartAction } from "../actions/get-cart-action";

type CartContextValue = {
  cart: ICartDTO;
  isPending: boolean;
  refreshCart: () => void;
  setCart: (cart: ICartDTO) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const emptyCart: ICartDTO = { id: "", items: [], subtotal: 0, itemCount: 0 };

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart?: ICartDTO;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<ICartDTO>(initialCart ?? emptyCart);
  const [isPending, startTransition] = useTransition();

  const refreshCart = useCallback(() => {
    startTransition(async () => {
      setCart((await getCartAction()) ?? emptyCart);
    });
  }, []);

  return (
    <CartContext.Provider value={{ cart, isPending, refreshCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}