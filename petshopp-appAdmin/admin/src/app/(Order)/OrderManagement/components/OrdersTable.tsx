"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Order, ITEMS_PER_PAGE } from "./types";
import OrderRow from "./OrderRow";

interface Props {
  orders: Order[];
  loading: boolean;
  filter: string;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  setCurrentPage: (p: number | ((prev: number) => number)) => void;
  getPageNumbers: () => number[];
  getStatusBadge: (status: string) => React.ReactNode;
  formatDate: (d: string) => string;
  getInitials: (name: string) => string;
  openTrackingModal: (order: Order) => void;
  setSelectedOrder: (order: Order) => void;
}

const OrdersTable = ({
  orders, loading, filter, currentPage, totalPages, totalOrders,
  setCurrentPage, getPageNumbers, getStatusBadge, formatDate,
  getInitials, openTrackingModal, setSelectedOrder,
}: Props) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div>
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-[#2d5a3d] border-t-[#97cba9] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-[#7aab8a] mt-4 text-center font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package className="w-20 h-20 text-gray-300 dark:text-[#2d5a3d] mb-4" />
        <p className="text-gray-600 dark:text-[#c8e6d0] font-semibold text-lg">
          No {filter === "cancellation_requested" ? "cancellation requests" : filter + " orders"} found
        </p>
        <p className="text-gray-500 dark:text-[#7aab8a] text-sm mt-1">Try selecting a different filter</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto lg:overflow-hidden rounded-t-2xl">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1e3d2a] dark:to-[#162820] border-b border-gray-200 dark:border-[#2d5a3d]">
              {["Order ID", "Customer", "Date", "Items", "Amount", "Status", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 sm:px-6 py-4 text-left text-xs font-black text-gray-600 dark:text-[#7aab8a] uppercase tracking-wider ${
                    i === 2 ? "hidden sm:table-cell" : i === 3 ? "hidden md:table-cell" : i === 6 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#2d5a3d]">
            <AnimatePresence>
              {orders.map((order, index) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  index={index}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                  getInitials={getInitials}
                  openTrackingModal={openTrackingModal}
                  setSelectedOrder={setSelectedOrder}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-[#2d5a3d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-[#7aab8a] font-medium">
            Showing{" "}
            <span className="font-bold text-gray-700 dark:text-[#c8e6d0]">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalOrders)}
            </span>{" "}
            of <span className="font-bold text-gray-700 dark:text-[#c8e6d0]">{totalOrders}</span> orders
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-500 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-500 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPageNumbers().map((page, idx) =>
              page < 0 ? (
                <span key={`e${idx}`} className="px-1 text-gray-400 dark:text-[#7aab8a] font-bold select-none">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-br from-[#97cba9] to-[#7ab89a] text-white shadow-md shadow-[#97cba9]/30"
                      : "text-gray-600 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a]"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-500 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-500 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersTable;