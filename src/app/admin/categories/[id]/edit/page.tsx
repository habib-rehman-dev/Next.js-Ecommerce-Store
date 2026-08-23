import { notFound } from "next/navigation";
import { getCategoryById } from "@/features/category/queries/get-category-by-id";
import { getCategories } from "@/features/category/queries/get-categories";
import { CategoryForm } from "@/features/category/components/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, parentOptions] = await Promise.all([
    getCategoryById(id),
    getCategories(),
  ]);

  if (!category) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit category</h1>
      <CategoryForm mode="edit" category={category} parentOptions={parentOptions} />
    </div>
  );
}
