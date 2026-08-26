"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, ChevronDown, ChevronRight } from "lucide-react";
import { IProduct } from "../types";
import { ProductRowActions } from "./ProductRowActions";

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
import React from "react";

type Props = {
  products: IProduct[];
};

export function ProductsTable({ products }: Props) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card">
        <p className="text-muted-foreground text-sm">No products found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category / Brand</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const isExpanded = expandedRows[product._id];
            const primaryImage = product.images[0]
            const categoryName =
              product.categoryId &&
              typeof product.categoryId === "object" &&
              "name" in product.categoryId
                ? product.categoryId.name
                : "—";
            const brandName =
              product.brandId &&
              typeof product.brandId === "object" &&
              "name" in product.brandId
                ? product.brandId.name
                : "—";

            return (
              <React.Fragment key={index}>
                <TableRow key={product._id} className="hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleRow(product._id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      /{product.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{categoryName}</div>
                    <div className="text-xs text-muted-foreground">
                      {brandName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {product.variants?.length || 0} Variant(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "outline"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductRowActions
                      productId={product._id}
                      productName={product.name}
                    />
                  </TableCell>
                </TableRow>

                {/* Variant Breakdown Row */}
                {isExpanded && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={7} className="p-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Variants Breakdown
                        </h4>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {product.variants.map((v, index) => (
                            <div
                              key={v._id || index}
                              className="p-3 bg-background border rounded-md text-xs space-y-1"
                            >
                              <div className="flex justify-between font-mono font-bold">
                                <span>SKU: {v.sku}</span>
                                <span>${v.price}</span>
                              </div>
                              <div className="text-muted-foreground">
                                Stock: {v.stock} units
                              </div>
                              {v.attributes &&
                                Object.keys(v.attributes).length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {Object.entries(v.attributes).map(
                                      ([key, value]) => (
                                        <Badge
                                          key={key}
                                          variant="outline"
                                          className="text-[10px] py-0"
                                        >
                                          {key}: {value}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
