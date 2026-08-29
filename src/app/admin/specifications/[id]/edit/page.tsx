import { notFound } from "next/navigation";
import { getSpecificationById } from "@/features/specification/queries/get-specification-by-id";
import { getCategories } from "@/features/category/queries/get-categories";
import { SpecificationForm } from "@/features/specification/components/SpecificationForm";

export default async function EditSpecificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [spec, categories] = await Promise.all([getSpecificationById(id), getCategories()]);

  if (!spec) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit specification</h1>
      <SpecificationForm mode="edit" spec={spec} categories={categories.map((c) => ({ _id: c.id, name: c.name }))} />
    </div>
  );
}