// import { useTransition } from "react"
// import { useCart } from "../context/CartProvider"
// import { addToCart } from "../actions/add-to-cart"
// import { removeCartItem } from "../actions/remove-cart-item"
// import { updateCartItem } from "../actions/update-cart-item"
// import type { ICartDTO, ICartItemDTO } from "../types"

// type CartOperation = 
//   | { type: "add"; item: ICartItemDTO }
//   | { type: "remove"; itemId: string }
//   | { type: "update"; itemId: string; quantity: number }
//   | { type: "reset"; cart: ICartDTO }

// export function useOptimisticCart() {
//   const { cart, setCart } = useCart()
//   const [isPending, startTransition] = useTransition()

//   const optimisticAddToCart = async (input: {
//     productId: string
//     variantId: string
//     quantity: number
//     productName: string
//     productSlug: string
//     productImage?: string
//     sku: string
//     attributes: Record<string, string>
//     price: number
//     discountPrice?: number
//     stock: number
//   }) => {
//     const previousCart = cart

//     // Optimistic update
//     const newItem: ICartItemDTO = {
//       ...input,
//     }

//     const existingIndex = cart.items.findIndex(
//       (item) =>
//         item.productId === input.productId &&
//         item.variantId === input.variantId
//     )

//     let updatedCart: ICartDTO
//     if (existingIndex >= 0) {
//       // Update existing item
//       updatedCart = {
//         ...cart,
//         items: cart.items.map((item, idx) =>
//           idx === existingIndex
//             ? { ...item, quantity: item.quantity + input.quantity }
//             : item
//         ),
//         itemCount: cart.itemCount + input.quantity,
//         subtotal:
//           cart.subtotal +
//           (input.discountPrice ?? input.price) * input.quantity,
//       }
//     } else {
//       // Add new item
//       updatedCart = {
//         ...cart,
//         items: [...cart.items, newItem],
//         itemCount: cart.itemCount + input.quantity,
//         subtotal:
//           cart.subtotal +
//           (input.discountPrice ?? input.price) * input.quantity,
//       }
//     }

//     setCart(updatedCart)

//     // Server action
//     startTransition(async () => {
//       const result = await addToCart({
//         productId: input.productId,
//         variantId: input.variantId,
//         quantity: input.quantity,
//       })

//       if (!result.success) {
//         // Rollback on error
//         setCart(previousCart)
//         console.error("Failed to add to cart:", result.message)
//       }
//     })
//   }

//   const optimisticRemoveFromCart = async (itemId: string) => {
//     const previousCart = cart

//     // Optimistic update
//     const itemToRemove = cart.items.find((item) => item.productId === itemId)
//     if (!itemToRemove) return

//     const updatedCart: ICartDTO = {
//       ...cart,
//       items: cart.items.filter((item) => item.productId !== itemId),
//       itemCount: cart.itemCount - itemToRemove.quantity,
//       subtotal:
//         cart.subtotal -
//         (itemToRemove.discountPrice ?? itemToRemove.price) *
//           itemToRemove.quantity,
//     }

//     setCart(updatedCart)

//     // Server action
//     startTransition(async () => {
//       const result = await removeCartItem(itemId)

//       if (!result.success) {
//         // Rollback on error
//         setCart(previousCart)
//         console.error("Failed to remove from cart:", result.message)
//       }
//     })
//   }

//   const optimisticUpdateQuantity = async (
//     itemId: string,
//     newQuantity: number
//   ) => {
//     const previousCart = cart

//     // Optimistic update
//     const item = cart.items.find((item) => item.productId === itemId)
//     if (!item) return

//     const quantityDiff = newQuantity - item.quantity
//     const updatedCart: ICartDTO = {
//       ...cart,
//       items: cart.items.map((cartItem) =>
//         cartItem.productId === itemId
//           ? { ...cartItem, quantity: newQuantity }
//           : cartItem
//       ),
//       itemCount: cart.itemCount + quantityDiff,
//       subtotal:
//         cart.subtotal +
//         (item.discountPrice ?? item.price) * quantityDiff,
//     }

//     setCart(updatedCart)

//     // Server action
//     startTransition(async () => {
//       const result = await updateCartItem({itemId, newQuantity})

//       if (!result.success) {
//         // Rollback on error
//         setCart(previousCart)
//         console.error("Failed to update cart item:", result.message)
//       }
//     })
//   }

//   return {
//     cart,
//     isPending,
//     addToCart: optimisticAddToCart,
//     removeFromCart: optimisticRemoveFromCart,
//     updateQuantity: optimisticUpdateQuantity,
//   }
// }
