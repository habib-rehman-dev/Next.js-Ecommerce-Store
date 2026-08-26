import { Types } from "mongoose";

export interface IProductVariant {
  _id?: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  discountPrice?: number;
  stock: number;
  images?: string[];
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: Types.ObjectId | { _id: string; name: string; slug: string };
  brandId: Types.ObjectId | { _id: string; name: string; slug: string };
  images: string[];
  imagePublicIds?: string[];
  variants: IProductVariant[];
  status: "active" | "inactive";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormValues = {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  brandId: string;
  status: "active" | "inactive";
  isFeatured: boolean;
  images: string[];
  imagePublicIds?: string[];
  variants: {
    sku: string;
    attributes: Record<string, string>;
    price: number;
    discountPrice?: number;
    stock: number;
    images?: string[];
  }[];
};