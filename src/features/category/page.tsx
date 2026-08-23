import Link from "next/link";
import { getCategories } from "@/features/category/queries/get-categories";
import { CategoryTable } from "@/features/category/components/CategoryTable";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          New category
        </Link>
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}