"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Discount, PAGE_SIZE } from "./useDiscounts";

interface Props {
  filteredDiscounts: Discount[];
  safePage: number;
  totalPages: number;
  setCurrentPage: (p: number | ((prev: number) => number)) => void;
}

const DiscountPagination = ({ filteredDiscounts, safePage, totalPages, setCurrentPage }: Props) => {
  if (filteredDiscounts.length === 0) return null;

  return (
    <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-slate-500 dark:text-[#7aab8a]">
        Showing{" "}
        <span className="font-semibold text-slate-700 dark:text-[#c8e6d0]">
          {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredDiscounts.length)}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700 dark:text-[#c8e6d0]">
          {filteredDiscounts.length}
        </span>{" "}
        entries
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          className="p-2 border border-slate-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-[#c8e6d0] hover:bg-slate-50 dark:hover:bg-[#1e3d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "…" ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 dark:text-[#7aab8a] text-sm">…</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item as number)}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-colors ${
                  safePage === item
                    ? "bg-[#97cba9] dark:bg-[#0b8457] text-white shadow-md"
                    : "border border-slate-200 dark:border-white/10 text-gray-700 dark:text-[#c8e6d0] hover:bg-slate-50 dark:hover:bg-[#1e3d2a]"
                }`}
              >
                {item}
              </button>
            ),
          )}

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          className="p-2 border border-slate-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-[#c8e6d0] hover:bg-slate-50 dark:hover:bg-[#1e3d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DiscountPagination;