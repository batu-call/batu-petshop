"use client";
import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Truck, Package, XCircle, AlertCircle } from "lucide-react";
import { Stats } from "./types";

interface Props {
  stats: Stats;
  statsLoading: boolean;
}

const STAT_CONFIG = [
  { key: "pending", color: "yellow", label: "Pending", icon: Clock, sub: "Awaiting processing" },
  { key: "paid", color: "paid", label: "Paid", icon: CheckCircle, sub: "Payment confirmed" },
  { key: "shipped", color: "blue", label: "Shipped", icon: Truck, sub: "Out for delivery" },
  { key: "delivered", color: "green", label: "Delivered", icon: Package, sub: "Completed" },
  { key: "cancelled", color: "red", label: "Cancelled", icon: XCircle, sub: "Refunded" },
  { key: "cancellation_requested", color: "orange", label: "Cancel Req.", icon: AlertCircle, sub: "Awaiting approval" },
];

const BG: Record<string, string> = {
  yellow: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800/40 shadow-yellow-100 dark:shadow-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  paid: "from-[#97cba9]/20 to-[#97cba9]/30 dark:from-[#0b8457]/20 dark:to-[#0b8457]/30 border-[#97cba9]/40 dark:border-[#2d5a3d] shadow-[#97cba9]/20 dark:shadow-[#0b8457]/20 text-[#5a9677] dark:text-[#97cba9]",
  blue: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800/40 shadow-blue-100 dark:shadow-blue-900/20 text-blue-600 dark:text-blue-400",
  green: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-green-200 dark:border-green-800/40 shadow-green-100 dark:shadow-green-900/20 text-green-600 dark:text-green-400",
  red: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-200 dark:border-red-800/40 shadow-red-100 dark:shadow-red-900/20 text-red-600 dark:text-red-400",
  orange: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border-orange-200 dark:border-orange-800/40 shadow-orange-100 dark:shadow-orange-900/20 text-orange-600 dark:text-orange-400",
};

const NUM: Record<string, string> = {
  yellow: "text-yellow-900 dark:text-yellow-200",
  paid: "text-[#4a7a5e] dark:text-[#c8e6d0]",
  blue: "text-blue-900 dark:text-blue-200",
  green: "text-green-900 dark:text-green-200",
  red: "text-red-900 dark:text-red-200",
  orange: "text-orange-900 dark:text-orange-200",
};

const OrdersStats = ({ stats, statsLoading }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`relative overflow-hidden bg-gradient-to-br rounded-2xl p-4 sm:p-5 border shadow-lg ${BG[stat.color]}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <p className="text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-2xl sm:text-3xl font-black mb-1 ${NUM[stat.color]}`}>
                {statsLoading ? "..." : stats[stat.key as keyof Stats]}
              </p>
              <p className="text-xs font-medium">{stat.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default OrdersStats;