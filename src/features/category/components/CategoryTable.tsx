import Link from "next/link";
import type { CategoryDTO } from "../types";
import { CategoryRowActions } from "./CategoryRowActions";

export function CategoryTable({ categories }: { categories: CategoryDTO[] }) {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No categories yet.{" "}
        <Link href="/admin/categories/new" className="underline">
          Create your first one
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Slug</th>
            <th className="px-4 py-2 font-medium">Parent</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Sort</th>
            <th className="px-4 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="px-4 py-2 font-medium">{c.name}</td>
              <td className="px-4 py-2 text-muted-foreground">{c.slug}</td>
              <td className="px-4 py-2 text-muted-foreground">
                {c.parentCategoryId ? (nameById.get(c.parentCategoryId) ?? "—") : "—"}
              </td>
              <td className="px-4 py-2">
                <span
                  className={
                    c.status === "active"
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                      : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  }
                >
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-2 text-muted-foreground">{c.sortOrder}</td>
              <td className="px-4 py-2 text-right">
                <CategoryRowActions id={c.id} name={c.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}