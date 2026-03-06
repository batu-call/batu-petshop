"use client";
import React from "react";
import { Tag, Percent, TrendingUp, Timer } from "lucide-react";

interface Props {
  activeDiscounts: number;
  totalUsage: number;
  avgDiscount: string;
  expiringSoon: number;
}

const DiscountStats = ({ activeDiscounts, totalUsage, avgDiscount, expiringSoon }: Props) => {
  const items = [
    {
      icon: <Tag className="w-5 h-5" />,
      bg: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      badge: <span className="text-green-500 text-xs font-bold">+12%</span>,
      label: "Active Coupons",
      value: activeDiscounts,
    },
    {
      icon: <Percent className="w-5 h-5" />,
      bg: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
      badge: <span className="text-green-500 text-xs font-bold">+5.4%</span>,
      label: "Discounts Applied",
      value: totalUsage.toLocaleString(),
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      bg: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      badge: <span className="text-purple-500 text-xs font-bold">Stable</span>,
      label: "Avg. Discount Value",
      value: `${avgDiscount}%`,
    },
    {
      icon: <Timer className="w-5 h-5" />,
      bg: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
      badge: <span className="text-red-500 text-xs font-bold">-2</span>,
      label: "Expiring Soon",
      value: expiringSoon,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((s, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#162820] p-6 rounded-xl border border-slate-200 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${s.bg}`}>
              {s.icon}
            </div>
            {s.badge}
          </div>
          <p className="text-slate-500 dark:text-[#7aab8a] text-xs font-medium uppercase tracking-wider">
            {s.label}
          </p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-[#c8e6d0]">{s.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default DiscountStats;