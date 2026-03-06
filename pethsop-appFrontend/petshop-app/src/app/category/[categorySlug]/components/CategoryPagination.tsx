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

const CategoryPagination = ({ page, totalPages, goToPage }: Props) => {
  const visibleCount = 5;
  let start = Math.max(2, page - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;

  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(2, end - visibleCount + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <Pagination className="mt-12 text-color dark:text-[#a8d4b8]">
      <PaginationContent>
        <PaginationItem className="cursor-pointer">
          <PaginationPrevious
            onClick={() => page > 1 && goToPage(page - 1)}
            className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:border-white/10 ${page === 1 ? "opacity-50 pointer-events-none" : ""}`}
          />
        </PaginationItem>

        <PaginationItem className="cursor-pointer">
          <PaginationLink
            isActive={page === 1}
            onClick={() => goToPage(1)}
            className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
          >
            1
          </PaginationLink>
        </PaginationItem>

        {start > 2 && (
          <PaginationItem>
            <span className="px-2 text-sm text-gray-400 dark:text-[#7aab8a]">…</span>
          </PaginationItem>
        )}

        {pages.map((p) => (
          <PaginationItem key={p} className="cursor-pointer">
            <PaginationLink
              isActive={page === p}
              onClick={() => goToPage(p)}
              className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {end < totalPages - 1 && (
          <PaginationItem>
            <span className="px-2 text-sm text-gray-400 dark:text-[#7aab8a]">…</span>
          </PaginationItem>
        )}

        <PaginationItem className="cursor-pointer">
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => goToPage(totalPages)}
            className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem className="cursor-pointer">
          <PaginationNext
            onClick={() => page < totalPages && goToPage(page + 1)}
            className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:border-white/10 ${page === totalPages ? "opacity-50 pointer-events-none" : ""}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CategoryPagination;