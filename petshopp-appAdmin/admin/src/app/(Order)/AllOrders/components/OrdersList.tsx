"use client";
import React from "react";
import { Package } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { OrdersType } from "./types";
import OrderCard from "./OrderCard";

type Props = {
  orders: OrdersType[];
  initialLoad: boolean;
  loading: boolean;
  totalPages: number;
  page: number;
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
  goToPage: (p: number) => void;
  getPaginationPages: () => number[];
  formatDate: (d: string) => string;
  getStatusColor: (status: string) => string;
};

const OrdersList = ({
  orders,
  initialLoad,
  loading,
  totalPages,
  page,
  expandedOrder,
  setExpandedOrder,
  hasActiveFilters,
  clearFilters,
  goToPage,
  getPaginationPages,
  formatDate,
  getStatusColor,
}: Props) => {
  const pages = getPaginationPages();

  if (initialLoad || loading) return null;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 flex justify-center">
          <Package className="w-16 h-16 text-color2 dark:text-[#7aab8a]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 dark:text-[#c8e6d0] mb-2">
          No orders found
        </h3>
        <p className="text-gray-500 dark:text-[#7aab8a] mb-6">
          {hasActiveFilters()
            ? "Try adjusting your filters to see more results"
            : "No orders available"}
        </p>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="bg-primary dark:bg-[#0b8457] text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] hover:text-[#393E46] dark:hover:text-[#c8e6d0] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        {orders.map((o) => (
          <OrderCard
            key={o._id}
            o={o}
            expandedOrder={expandedOrder}
            setExpandedOrder={setExpandedOrder}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8 dark:text-[#c8e6d0]">
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
                className={
                  page === 1
                    ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]"
                    : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"
                }
              >
                1
              </PaginationLink>
            </PaginationItem>
            {pages.length > 0 && pages[0] > 2 && (
              <PaginationItem>
                <span className="px-2 text-sm dark:text-[#7aab8a]">…</span>
              </PaginationItem>
            )}
            {pages.map((p) => (
              <PaginationItem key={p} className="cursor-pointer">
                <PaginationLink
                  isActive={page === p}
                  onClick={() => goToPage(p)}
                  className={
                    page === p
                      ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]"
                      : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"
                  }
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            {pages.length > 0 && pages[pages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <span className="px-2 text-sm dark:text-[#7aab8a]">…</span>
              </PaginationItem>
            )}
            {totalPages > 1 && (
              <PaginationItem className="cursor-pointer">
                <PaginationLink
                  isActive={page === totalPages}
                  onClick={() => goToPage(totalPages)}
                  className={
                    page === totalPages
                      ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]"
                      : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"
                  }
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem className="cursor-pointer">
              <PaginationNext
                onClick={() => page < totalPages && goToPage(page + 1)}
                className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d] ${page === totalPages ? "opacity-50 pointer-events-none" : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

export default OrdersList;