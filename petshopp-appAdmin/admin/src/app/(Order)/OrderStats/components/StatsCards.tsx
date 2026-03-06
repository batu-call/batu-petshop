"use client";
import React from "react";
import { OrderStatsData } from "../hooks/useOrderStats";

interface Props {
  data: OrderStatsData;
}

const CARDS = [
  {
    key: "totalOrders" as const,
    label: "Total Orders",
    badge: "All Time",
    gradient: "from-[#97cba9] to-[#6db491]",
    hover: "hover:border-[#97cba9]/30 dark:hover:border-[#7aab8a]/40",
    blob: "from-[#97cba9]/10 dark:from-[#0b8457]/20",
    bar: "from-[#97cba9] to-[#6db491]",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    key: "pendingOrders" as const,
    label: "Pending Orders",
    badge: "Waiting",
    gradient: "from-amber-400 to-amber-600",
    hover: "hover:border-amber-400/30 dark:hover:border-amber-400/30",
    blob: "from-amber-400/10 dark:from-amber-900/20",
    bar: "from-amber-400 to-amber-600",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "completedOrders" as const,
    label: "Completed Orders",
    badge: "Success",
    gradient: "from-emerald-400 to-emerald-600",
    hover: "hover:border-emerald-400/30 dark:hover:border-emerald-400/30",
    blob: "from-emerald-400/10 dark:from-emerald-900/20",
    bar: "from-emerald-400 to-emerald-600",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "cancelledOrders" as const,
    label: "Cancelled Orders",
    badge: "Failed",
    gradient: "from-red-400 to-red-600",
    hover: "hover:border-red-400/30 dark:hover:border-red-400/30",
    blob: "from-red-400/10 dark:from-red-900/20",
    bar: "from-red-400 to-red-600",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const StatsCards = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {CARDS.map((card) => {
        const value = data[card.key];
        const pct = card.key === "totalOrders"
          ? 100
          : Math.min((value / data.totalOrders) * 100, 100);

        return (
          <div
            key={card.key}
            className={`group relative bg-white dark:bg-[#162820] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-[#2d5a3d] ${card.hover} overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${card.blob} to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  {card.icon}
                </div>
                <span className="text-sm font-bold text-gray-400 dark:text-[#7aab8a] uppercase tracking-wider">
                  {card.badge}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-black text-[#2d5f4a] dark:text-[#c8e6d0] tabular-nums">
                  {value.toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-gray-500 dark:text-[#7aab8a]">{card.label}</p>
              </div>
              <div className="mt-6 h-1.5 bg-gray-100 dark:bg-[#0d1f18] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${card.bar} rounded-full transition-all duration-1000`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;