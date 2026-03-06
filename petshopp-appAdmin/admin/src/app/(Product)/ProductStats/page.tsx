"use client";
import React from "react";
import CircularText from "@/components/CircularText";
import { useProductStats } from "./hooks/useProductStats";
import { useTheme } from "next-themes";
import ProductCategoryChart from "./components/ProductCategoryChart";
import FeaturedProducts from "./components/FeaturedProducts";
import StatsGrid from "./components/StatsGrid";

const Page = () => {
  const { data, loading, mounted } = useProductStats();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (loading) {
    return (
      <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-linear-to-br from-[#97cba9] to-[#5a9d7a] dark:from-[#0E5F44] dark:to-[#0d1f18] z-50">
        <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
      </div>
    );
  }

  if (!data)
    return <div className="ml-40 mt-10 text-gray-500 dark:text-[#7aab8a]">No product stats found.</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-[#97cba9]/5 dark:from-[#0d1f18] dark:via-[#0d1f18] dark:to-[#162820] p-8">
      <div className="mb-12 animate-fadeIn">
        <div className="flex items-end gap-4 mb-2">
          <div className="w-2 h-12 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9] dark:from-[#a8d4b8] dark:to-[#7aab8a]">
            Product Analytics
          </h1>
        </div>
        <p className="text-gray-500 dark:text-[#7aab8a] ml-6 font-medium">
          Track inventory, categories and product performance
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ProductCategoryChart categoryData={data.categoryData} mounted={mounted} isDark={isDark} />
          <FeaturedProducts
            featuredProducts={data.featuredProducts}
            featuredProductsList={data.featuredProductsList}
          />
        </div>

        <StatsGrid data={data} />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Page;