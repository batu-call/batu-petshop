"use client";
import React from "react";
import { useTheme } from "next-themes";

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    payload: { month: string; orders: number; revenue: number };
  }[];
  mounted?: boolean;
}

const MonthlyOrdersTooltip: React.FC<CustomTooltipProps> = ({ active, payload, mounted }) => {
  const { resolvedTheme } = useTheme();

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const [year, month] = data.month.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    const monthName = date.toLocaleString("en-US", { month: "long", year: "numeric" });

    return (
      <div className={`border-2 rounded-2xl shadow-xl px-4 py-3 backdrop-blur-sm ${
        isDark
          ? "bg-[#162820] border-[#2d5a3d]"
          : "bg-white border-[#97cba9]/30"
      }`}>
        <p className={`text-sm font-bold mb-1 ${isDark ? "text-[#c8e6d0]" : "text-[#2d5f4a]"}`}>{monthName}</p>
        <p className="text-base text-[#97cba9] font-bold">
          {data.orders}{" "}
          <span className={`text-xs font-medium ${isDark ? "text-[#7aab8a]" : "text-gray-500"}`}>
            order{data.orders !== 1 ? "s" : ""}
          </span>
        </p>
        <p className={`text-sm mt-1 ${isDark ? "text-[#7aab8a]" : "text-gray-600"}`}>
          Revenue:{" "}
          <span className={`font-bold ${isDark ? "text-[#c8e6d0]" : ""}`}>
            ${data.revenue.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default MonthlyOrdersTooltip;