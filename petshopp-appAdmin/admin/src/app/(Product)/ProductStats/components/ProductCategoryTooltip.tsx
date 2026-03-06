"use client";
import React from "react";

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

const ProductCategoryTooltip: React.FC<CustomPieTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#162820] border-2 border-[#97cba9]/30 dark:border-[#2d5a3d] rounded-2xl shadow-xl px-4 py-3">
        <p className="text-sm font-bold text-[#2d5f4a] dark:text-[#c8e6d0]">{payload[0].name}</p>
        <p className="text-base text-[#97cba9] dark:text-[#7aab8a] font-bold mt-1">
          {payload[0].value}{" "}
          <span className="text-xs font-medium text-gray-500 dark:text-[#7aab8a]">
            product{payload[0].value !== 1 ? "s" : ""}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default ProductCategoryTooltip;