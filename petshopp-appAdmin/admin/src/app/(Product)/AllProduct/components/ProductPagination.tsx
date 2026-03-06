"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  page: number;
  totalPages: number;
  goToPage: (p: number) => void;
};

const ProductPagination = ({ page, totalPages, goToPage }: Props) => {
  const visibleCount = 5;
  let start = Math.max(2, page - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;
  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(2, end - visibleCount + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <Pagination className="mt-12 text-color dark:text-[#c8e6d0]">
      <PaginationContent>
        <PaginationItem className="cursor-pointer">
          <PaginationPrevious
            onClick={() => page > 1 && goToPage(page - 1)}
            className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d] ${page === 1 ? "opacity-50 pointer-events-none" : ""}`}
          />
        </PaginationItem>
        <PaginationItem className="cursor-pointer">
          <PaginationLink
            isActive={page === 1}
            onClick={() => goToPage(1)}
            className={page === 1 ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]" : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"}
          >
            1
          </PaginationLink>
        </PaginationItem>
        {start > 2 && (
          <PaginationItem>
            <span className="px-2 text-sm dark:text-[#7aab8a]">…</span>
          </PaginationItem>
        )}
        {pages.map((p) => (
          <PaginationItem key={p} className="cursor-pointer">
            <PaginationLink
              isActive={page === p}
              onClick={() => goToPage(p)}
              className={page === p ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]" : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        {end < totalPages - 1 && (
          <PaginationItem>
            <span className="px-2 text-sm dark:text-[#7aab8a]">…</span>
          </PaginationItem>
        )}
        <PaginationItem className="cursor-pointer">
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => goToPage(totalPages)}
            className={page === totalPages ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]" : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem className="cursor-pointer">
          <PaginationNext
            onClick={() => page < totalPages && goToPage(page + 1)}
            className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d] ${page === totalPages ? "opacity-50 pointer-events-none" : ""}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProductPagination;