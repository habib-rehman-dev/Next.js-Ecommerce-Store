import { useTransition } from "react"
import { useWishlist } from "../context/WishlistProvider"
import { toggleWishlist } from "../actions/wishlist-actions"
import type { IWishlistDTO } from "../types"

export function useOptimisticWishlist() {
  const { wishlist, setWishlist } = useWishlist()
  const [isPending, startTransition] = useTransition()

  const optimisticToggleWishlist = async (productId: string) => {
    const previousWishlist = wishlist
    const isCurrentlyWishlisted = wishlist.productIds.includes(productId)

    // Optimistic update
    const updatedWishlist: IWishlistDTO = {
      ...wishlist,
      productIds: isCurrentlyWishlisted
        ? wishlist.productIds.filter((id) => id !== productId)
        : [...wishlist.productIds, productId],
      count: isCurrentlyWishlisted
        ? wishlist.count - 1
        : wishlist.count + 1,
    }

    setWishlist(updatedWishlist)

    // Server action
    startTransition(async () => {
      const result = await toggleWishlist({ productId })

      if (!result.success) {
        // Rollback on error
        setWishlist(previousWishlist)
        console.error("Failed to toggle wishlist:", result.message)
      }
    })
  }

  const isWishlisted = (productId: string) =>
    wishlist.productIds.includes(productId)

  return {
    wishlist,
    isPending,
    toggleWishlist: optimisticToggleWishlist,
    isWishlisted,
    count: wishlist.count,
  }
}
