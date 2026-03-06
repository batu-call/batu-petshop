"use client";
import React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

const OrdersHeader = ({ searchQuery, setSearchQuery }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-[#0d1f18]/80 border-b border-gray-200 dark:border-[#2d5a3d] px-4 sm:px-8 py-4 sm:py-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-[#a8d4b8] dark:to-[#7aab8a] bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#7aab8a] mt-1">
              Track and manage customer orders in real-time
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#7aab8a]" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-[#2d5a3d] bg-white dark:bg-[#162820] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-2 focus:ring-[#97cba9] focus:border-transparent transition-all"
              maxLength={50}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7aab8a] hover:text-gray-600 dark:hover:text-[#c8e6d0]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrdersHeader;