import Link from "next/link";
import { Plus } from "lucide-react";
import { getSpecifications } from "@/features/specification/queries/get-specifications";
import { SpecificationsTable } from "@/features/specification/components/SpecificationsTable";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminSpecificationsPage() {
  const specs = await getSpecifications();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Specifications</h1>
          <p className="text-sm text-muted-foreground">
            Suggested attribute values per category, used as quick-fill chips on the product form.
          </p>
        </div>
        <Link href="/admin/specifications/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Specification</Button>
        </Link>
      </div>

      <SpecificationsTable specs={specs} />
    </div>
  );
}