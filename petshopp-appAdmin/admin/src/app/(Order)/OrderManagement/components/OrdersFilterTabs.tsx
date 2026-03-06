"use client";
import React from "react";
import { motion } from "framer-motion";

interface Props {
  filter: string;
  loading: boolean;
  handleFilterChange: (status: string) => void;
}

const TABS = ["pending", "paid", "shipped", "delivered", "cancelled", "cancellation_requested"];

const OrdersFilterTabs = ({ filter, loading, handleFilterChange }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex gap-2 bg-white dark:bg-[#162820] p-1.5 rounded-xl border border-gray-200 dark:border-[#2d5a3d] w-full overflow-x-auto"
    >
      {TABS.map((status) => (
        <button
          key={status}
          onClick={() => handleFilterChange(status)}
          disabled={loading}
          className={`cursor-pointer px-4 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
            filter === status
              ? status === "cancellation_requested"
                ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-400/30"
                : "bg-gradient-to-br from-[#97cba9] to-[#7ab89a] text-white shadow-lg shadow-[#97cba9]/30"
              : "text-gray-600 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a]"
          }`}
        >
          {status === "cancellation_requested"
            ? "Cancel Requests"
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </motion.div>
  );
};

export default OrdersFilterTabs;