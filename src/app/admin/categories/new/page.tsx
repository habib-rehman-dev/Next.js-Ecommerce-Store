import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCategories } from "@/features/category/queries/get-categories";
import { CategoryForm } from "@/features/category/components/CategoryForm";
import { Button } from "@/components/ui/button";

export default async function NewCategoryPage() {
  const parentOptions = await getCategories();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Category</h1>
          <p className="text-sm text-muted-foreground">
            Add a new category to your store catalog.
          </p>
        </div>
      </div>

      <CategoryForm mode="create" parentOptions={parentOptions} />
    </div>
  );
}