"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from "react"
import type { IWishlistDTO } from "../types"

type WishlistContextValue = {
  wishlist: IWishlistDTO
  isPending: boolean
  setWishlist: (wishlist: IWishlistDTO) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const emptyWishlist: IWishlistDTO = { id: "", productIds: [], count: 0 }

export function WishlistProvider({
  initialWishlist,
  children,
}: {
  initialWishlist?: IWishlistDTO
  children: React.ReactNode
}) {
  const [wishlist, setWishlist] = useState<IWishlistDTO>(
    initialWishlist ?? emptyWishlist
  )
  const [isPending] = useTransition()

  return (
    <WishlistContext.Provider value={{ wishlist, isPending, setWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider")
  return ctx
}
