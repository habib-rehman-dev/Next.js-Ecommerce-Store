'use client';

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
};

export function ProductsPagination({ pagination }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const generatePaginationItems = () => {
    const { pages, page: currentPage } = pagination;
    const items: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      if (currentPage > 3) items.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(pages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(i);
      }
      
      if (currentPage < pages - 2) items.push('ellipsis');
      items.push(pages);
    }
    
    return items;
  };

  if (pagination.pages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/5">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Page {pagination.page} of {pagination.pages}
      </div>
      
      <Pagination className="order-1 sm:order-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => pagination.page > 1 && navigateToPage(pagination.page - 1)}
              className={pagination.page <= 1 || isPending ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {generatePaginationItems().map((item, index) => (
            <PaginationItem key={index}>
              {item === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => navigateToPage(item)}
                  isActive={item === pagination.page}
                  className="cursor-pointer"
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => pagination.page < pagination.pages && navigateToPage(pagination.page + 1)}
              className={pagination.page >= pagination.pages || isPending ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}