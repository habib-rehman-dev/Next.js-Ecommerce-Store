import Link from "next/link";
import { Plus } from "lucide-react";

import { getCategories } from "@/features/category/queries/get-categories";
import { CategoryTable } from "@/features/category/components/CategoryTable";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage product categories and hierarchy for your store.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New category
          </Button>
        </Link>
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}