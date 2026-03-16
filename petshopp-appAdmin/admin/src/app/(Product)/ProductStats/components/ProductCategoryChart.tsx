"use client";
import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";
import ProductCategoryTooltip from "./ProductCategoryTooltip";

const COLORS = ["#97cba9", "#6db491", "#5a9d7a", "#2d5f4a", "#00C49F", "#FFBB28", "#FF8042"];

interface Props {
  categoryData: { name: string; count: number }[];
  mounted: boolean;
  isDark?: boolean;
}

const ProductCategoryChart = ({ categoryData, mounted, isDark = false }: Props) => {
  return (
    <div className="bg-white dark:bg-[#162820] rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-[#2d5a3d]">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-2 h-6 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
          <h2 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9] dark:from-[#a8d4b8] dark:to-[#7aab8a]">
            Product Distribution by Category
          </h2>
        </div>
        <p className="text-gray-500 dark:text-[#7aab8a] ml-6 text-sm font-medium">
          Category breakdown and inventory distribution
        </p>
      </div>

      {mounted && (
        <>
          <div className="block md:hidden w-full">
            <ResponsiveContainer width="100%" height={categoryData.length * 46 + 16}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                barSize={22}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2d5a3d" : "#e5e7eb"} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? "#7aab8a" : "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={58} tick={{ fontSize: 12, fontWeight: 600, fill: isDark ? "#a8d4b8" : "#374151" }} axisLine={false} tickLine={false} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                  <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 700, fill: isDark ? "#a8d4b8" : "#374151" }} />
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="hidden md:block w-full" style={{ height: "350px" }}>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="name"
                  outerRadius={120}
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={true}
                  isAnimationActive={false}
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
          </div>
        </>
      )}
    </div>
  );
};

export default ProductCategoryChart;