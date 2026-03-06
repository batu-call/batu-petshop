"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ProductCategoryTooltip from "./ProductCategoryTooltip";

const COLORS = ["#97cba9", "#6db491", "#5a9d7a", "#2d5f4a", "#00C49F", "#FFBB28", "#FF8042"];

interface Props {
  categoryData: { name: string; count: number }[];
  mounted: boolean;
  isDark?: boolean;
}

const ProductCategoryChart = ({ categoryData, mounted, isDark = false }: Props) => {
  return (
    <div className="bg-white dark:bg-[#162820] rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-[#2d5a3d]">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-2 h-6 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9] dark:from-[#a8d4b8] dark:to-[#7aab8a]">
            Product Distribution by Category
          </h2>
        </div>
        <p className="text-gray-500 dark:text-[#7aab8a] ml-6 text-sm font-medium">
          Category breakdown and inventory distribution
        </p>
      </div>
      <div className="w-full" style={{ height: "350px" }}>
        {mounted && (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="name"
                outerRadius={120}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={true}
                stroke={isDark ? "#162820" : "#fff"}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ProductCategoryTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: isDark ? "#a8d4b8" : undefined,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProductCategoryChart;