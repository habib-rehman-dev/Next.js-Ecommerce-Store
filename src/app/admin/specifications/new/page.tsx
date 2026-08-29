import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/features/category/queries/get-categories";
import { SpecificationForm } from "@/features/specification/components/SpecificationForm";
import { Button } from "@/components/ui/button";

export default async function NewSpecificationPage() {
  const categories = await getCategories();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/specifications">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Specification</h1>
          <p className="text-sm text-muted-foreground">Define allowed attribute values for a category.</p>
        </div>
      </div>

      <SpecificationForm mode="create" categories={categories.map((c) => ({ _id: c.id, name: c.name }))} />
    </div>
  );
}