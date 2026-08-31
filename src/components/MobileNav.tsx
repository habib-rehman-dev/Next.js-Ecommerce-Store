"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface MobileNavProps {
  navLinks: Array<{ label: string; href: string }>;
  categories?: Array<{ id: string; name: string }>;
  isAdmin?: boolean;
}

export function MobileNav({
  navLinks,
  categories = [],
  isAdmin = false,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        }
      ></SheetTrigger>

      <SheetContent side="left" className="w-[80vw] sm:w-80 glass-morphism">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        <nav className="mt-6 space-y-2">
          {/* Main Navigation Links */}
          {navLinks.map((link) => (
            <SheetClose key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}

          {/* Categories */}
          {categories.length > 0 && (
            <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                Categories
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2 pl-4">
                {categories.map((cat) => (
                  <SheetClose key={cat.id}>
                    <Link
                      href={`/products?categoryId=${cat.id}`}
                      className="block rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {cat.name}
                    </Link>
                  </SheetClose>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Admin Link */}
          {isAdmin && (
            <SheetClose>
              <Link
                href="/admin"
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Admin Dashboard
              </Link>
            </SheetClose>
          )}
        </nav>

        {/* Footer Links */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 p-4 space-y-2">
          <SheetClose>
            <Link
              href="/orders"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              My Orders
            </Link>
          </SheetClose>
          <SheetClose>
            <Link
              href="/wishlist"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Wishlist
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
