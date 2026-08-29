"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";

import { deleteSpecification } from "../actions/delete-specification";
import type { ISpecificationDTO } from "../types";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SpecificationsTable({ specs }: { specs: ISpecificationDTO[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteSpecification(id);
      setPendingId(null);
    });
  }

  if (specs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No specifications defined yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Values</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specs.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell className="text-muted-foreground">{s.categoryName ?? "—"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {s.values.slice(0, 5).map((v) => (
                    <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                  ))}
                  {s.values.length > 5 && (
                    <Badge variant="secondary" className="text-xs">+{s.values.length - 5}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={`/admin/specifications/${s.id}/edit`} />}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending && pendingId === s.id}
                    onClick={() => handleDelete(s.id, s.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}