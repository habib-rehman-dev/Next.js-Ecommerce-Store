import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {dbConnect} from "@/lib/db/dbConnect";
import { Category } from "@/models/Category";
import { Brand } from "@/models/Brand";
import { ProductForm } from "@/features/product/components/ProductForm";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await dbConnect();

  // Fetch categories and brands concurrently for optimal page load speed
  const [categoriesData, brandsData] = await Promise.all([
    Category.find({ status: "active" }).select("_id name").lean(),
    Brand.find({ status: "active" }).select("_id name").lean(),
  ]);

  // Serialize MongoDB documents (converting ObjectIds to plain strings)
  const categories = categoriesData.map((c: { _id: { toString(): string }; name: string }) => ({
    _id: c._id.toString(),
    name: c.name,
  }));

  const brands = brandsData.map((b: { _id: { toString(): string }; name: string }) => ({
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
          <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
          <p className="text-sm text-muted-foreground">
            Add a new item along with its gallery images and variant configurations.
          </p>
        </div>
      </div>

      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
      />
    </div>
  );
}