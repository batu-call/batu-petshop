"use client";
import React from "react";
import Link from "next/link";
import { ProductStatsData } from "../hooks/useProductStats";

interface Props {
  featuredProducts: number;
  featuredProductsList: ProductStatsData["featuredProductsList"];
}

const FeaturedProducts = ({ featuredProducts, featuredProductsList }: Props) => {
  return (
    <div className="bg-white dark:bg-[#162820] rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-[#2d5a3d]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-[#2d5f4a] dark:text-[#c8e6d0]">Featured Products</h3>
          <p className="text-sm text-gray-500 dark:text-[#7aab8a] mt-1">{featuredProducts} products featured</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#97cba9] to-[#6db491] flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      </div>

      {featuredProductsList.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#1e3d2a] flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400 dark:text-[#7aab8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#7aab8a] italic">No featured products yet</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {featuredProductsList.map((p, idx) => (
              <li key={p._id} className="group">
                <Link
                  href={`/Products/${p.slug}`}
                  aria-label={`Go to product ${p.product_name}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#97cba9]/5 dark:hover:bg-[#1e3d2a] transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#97cba9]/20 to-[#6db491]/20 dark:from-[#0b8457]/30 dark:to-[#2d5a3d]/30 flex items-center justify-center text-sm font-bold text-[#2d5f4a] dark:text-[#a8d4b8]">
                    {idx + 1}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-gray-700 dark:text-[#c8e6d0] group-hover:text-[#2d5f4a] dark:group-hover:text-[#a8d4b8] transition-colors line-clamp-1">
                    {p.product_name}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 dark:text-[#7aab8a] group-hover:text-[#97cba9] dark:group-hover:text-[#a8d4b8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {featuredProducts > featuredProductsList.length && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2d5a3d]">
              <Link
                href="/AllProduct?page=1&isFeatured=true"
                className="group flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#97cba9]/10 dark:bg-[#1e3d2a] hover:bg-[#97cba9]/20 dark:hover:bg-[#2d5a3d] border border-[#97cba9]/20 dark:border-[#2d5a3d] hover:border-[#97cba9]/50 dark:hover:border-[#7aab8a]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#5a9d7a] dark:text-[#7aab8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-sm font-bold text-[#2d5f4a] dark:text-[#c8e6d0]">
                    View all {featuredProducts} featured products
                  </span>
                </div>
                <svg className="w-4 h-4 text-[#97cba9] dark:text-[#7aab8a] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeaturedProducts;