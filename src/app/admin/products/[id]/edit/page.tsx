import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {dbConnect} from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Brand } from "@/models/Brand";

import { ProductForm } from "@/features/product/components/ProductForm";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  await dbConnect();

  // Fetch product, categories, and brands concurrently
  const [productData, categoriesData, brandsData] = await Promise.all([
    Product.findById(id).lean(),
    Category.find({ status: "active" }).select("_id name").lean(),
    Brand.find({ status: "active" }).select("_id name").lean(),
  ]);

  if (!productData) {
    notFound();
  }

  // Safely serialize MongoDB documents
  const product = JSON.parse(JSON.stringify(productData));

  const categories = categoriesData.map((c: { _id: { toString: () => string }; name: string }) => ({
    _id: c._id.toString(),
    name: c.name,
  }));

  const brands = brandsData.map((b: { _id: { toString: () => string }; name: string }) => ({
    _id: b._id.toString(),
    name: b.name,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Products</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update product details, manage image gallery, or adjust inventory variants.
          </p>
        </div>
      </div>

      <ProductForm
        mode="edit"
        product={product}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}