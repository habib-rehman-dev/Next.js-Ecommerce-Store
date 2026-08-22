import { Schema, model, models, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  variantId: Types.ObjectId; // points at the specific variant _id inside that product's variants array
  quantity: number;
}

export interface ICart {
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: false },
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true }, // one cart per user
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Cart = models.Cart || model<ICart>("Cart", cartSchema);