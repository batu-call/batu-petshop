"use client";
import React from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import MonthlyOrdersTooltip from "./MonthlyOrdersTooltip";

interface Props {
  monthlyStats: { month: string; orders: number; revenue: number }[];
  mounted: boolean;
}

const MonthlyOrdersChart = ({ monthlyStats, mounted }: Props) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="bg-white dark:bg-[#162820] rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-[#2d5a3d] overflow-hidden">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-2 h-8 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9] dark:from-[#a8d4b8] dark:to-[#7aab8a]">
            Monthly Orders (Last 6 Months)
          </h2>
        </div>
        <p className="text-gray-500 dark:text-[#7aab8a] ml-6 text-sm font-medium">
          Order volume and revenue trends over time
        </p>
      </div>

      <div className="w-full" style={{ height: 320 }}>
        {mounted && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={monthlyStats}
              margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="orderBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#97cba9" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6db491" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#2d5a3d" : "#f0f0f0"}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke={isDark ? "#2d5a3d" : "#9ca3af"}
                tick={{ fontSize: 13, fontWeight: 600, fill: isDark ? "#7aab8a" : "#6b7280" }}
                axisLine={{ stroke: isDark ? "#2d5a3d" : "#e5e7eb", strokeWidth: 2 }}
                tickLine={false}
                dy={12}
                tickFormatter={(monthStr) => {
                  const [year, month] = monthStr.split("-");
                  const date = new Date(Number(year), Number(month) - 1);
                  return date.toLocaleString("en-US", { month: "short" });
                }}
              />
              <YAxis
                stroke={isDark ? "#2d5a3d" : "#9ca3af"}
                tick={{ fontSize: 13, fontWeight: 600, fill: isDark ? "#7aab8a" : "#6b7280" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                dx={-12}
              />
              <Tooltip
                content={<MonthlyOrdersTooltip />}
                cursor={{ fill: isDark ? "rgba(45,90,61,0.3)" : "rgba(151, 203, 169, 0.1)", radius: 8 }}
              />
              <Bar
                dataKey="orders"
                fill="url(#orderBarGradient)"
                radius={[12, 12, 0, 0]}
                barSize={48}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MonthlyOrdersChart;