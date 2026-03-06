"use client";
import React from "react";
import StatBox from "./StatBox";
import { ProductStatsData } from "../hooks/useProductStats";

interface Props {
  data: ProductStatsData;
}

const StatsGrid = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4 h-fit">
      <StatBox
        title="Total Products"
        value={data.totalProducts}
        href="/AllProduct?page=1"
        gradient="from-[#97cba9] to-[#6db491]"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
      <StatBox
        title="In Stock"
        value={data.inStock}
        href="/AllProduct?page=1&minStock=1"
        gradient="from-emerald-400 to-emerald-600"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatBox
        title="Out of Stock"
        value={data.outOfStock}
        href="/AllProduct?page=1&maxStock=0"
        gradient="from-red-400 to-red-600"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatBox
        title="Sold Products"
        value={data.totalSold}
        href="/AllProduct?page=1&minSold=1"
        gradient="from-blue-400 to-blue-600"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
      />
      <StatBox
        title="New This Month"
        value={data.newThisMonth}
        href="/AllProduct?page=1"
        gradient="from-purple-400 to-purple-600"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />
      <StatBox
        title="Active Products"
        value={data.activeProducts}
        href="/AllProduct?page=1&isActive=true"
        gradient="from-amber-400 to-amber-600"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />
      <StatBox
        title="Inactive Products"
        value={data.inactiveProducts}
        href="/AllProduct?page=1&isActive=false"
        gradient="from-gray-400 to-gray-600"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        }
      />
      {/* ✅ Featured StatBox */}
      <StatBox
        title="Featured"
        value={data.featuredProducts}
        href="/AllProduct?page=1&isFeatured=true"
        gradient="from-yellow-400 to-orange-400"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        }
      />
    </div>
  );
};

export default StatsGrid;