import { getCategories } from "@/features/category/queries/get-categories";
import { CategoryForm } from "@/features/category/components/CategoryForm";

export default async function NewCategoryPage() {
  const parentOptions = await getCategories();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">New category</h1>
      <CategoryForm mode="create" parentOptions={parentOptions} />
    </div>
  );
}