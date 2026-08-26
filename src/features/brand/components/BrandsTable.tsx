import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { IBrand } from "../types";
import { BrandRowActions } from "./BrandRowActions";

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

export function BrandTable({ brands }: { brands: IBrand[] }) {
  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">No brands found.</p>
        <Button variant="link"  className="mt-2">
          <Link href="/admin/brands/new">Create your first brand</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              {/* Brand Logo */}
              <TableCell>
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                  {brand.logo ? (
                    <Image 
                      src={brand.logo} 
                      alt={brand.name} 
                      fill 
                      className="object-contain p-1" 
                    />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableCell>

              {/* Name */}
              <TableCell className="font-medium">{brand.name}</TableCell>

              {/* Slug */}
              <TableCell className="text-muted-foreground font-mono text-xs">
                {brand.slug}
              </TableCell>

              {/* Description */}
              <TableCell className="text-muted-foreground max-w-50 truncate text-xs">
                {brand.description || "—"}
              </TableCell>

              {/* Status Badge */}
              <TableCell>
                <Badge variant={brand.status === "active" ? "default" : "secondary"}>
                  {brand.status}
                </Badge>
              </TableCell>

              {/* Created Date */}
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                {new Date(brand.createdAt).toLocaleDateString()}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                {/* Place brand actions here */}
                <BrandRowActions id={brand.id} name={brand.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}