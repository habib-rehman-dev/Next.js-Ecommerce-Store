import { notFound } from "next/navigation";
import { getBrandById } from "@/features/brand/queries/get-brand-by-id";
import { BrandForm } from "@/features/brand/components/BrandForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit brand</h1>
      <BrandForm mode="edit" brand={brand} />
    </div>
  );
}
