import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { CategoryDTO } from "../types";
import { CategoryRowActions } from "./CategoryRowActions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CategoryTable({ categories }: { categories: CategoryDTO[] }) {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">No categories found.</p>
        <Button variant="link" render={<Link href="/admin/categories/new" />} className="mt-2">
          Create your first category
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                  {c.image ? (
                    <Image src={c.image} alt="" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {c.slug}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {c.parentCategoryId ? (nameById.get(c.parentCategoryId) ?? "—") : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={c.status === "active" ? "default" : "secondary"}>
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{c.sortOrder}</TableCell>
              <TableCell className="text-right">
                <CategoryRowActions id={c.id} name={c.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}