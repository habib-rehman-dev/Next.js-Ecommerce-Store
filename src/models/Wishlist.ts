import { Schema, model, models, Types } from "mongoose";

export interface IWishlist {
  userId: string;
  productIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: String, required: true, unique: true }, // one wishlist per user
    productIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  },
  { timestamps: true },
);

export const Wishlist = models.Wishlist || model<IWishlist>("Wishlist", wishlistSchema);