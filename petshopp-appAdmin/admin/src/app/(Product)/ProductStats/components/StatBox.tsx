"use client";
import React from "react";
import Link from "next/link";

interface Props {
  title: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}

const StatBox = ({ title, value, href, icon, gradient }: Props) => (
  <Link href={href} aria-label={`View details for ${title}`}>
    <div className="group relative bg-white dark:bg-[#162820] rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-[#2d5a3d] hover:border-[#97cba9]/30 dark:hover:border-[#7aab8a]/40 overflow-hidden cursor-pointer h-60">
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#97cba9]/10 to-transparent dark:from-[#0b8457]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="relative">
        <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">{icon}</div>
        </div>
        <p className="text-sm font-bold text-gray-500 dark:text-[#7aab8a] uppercase tracking-wider mb-2">{title}</p>
        <p className="text-4xl font-black text-[#2d5f4a] dark:text-[#c8e6d0] tabular-nums">{value.toLocaleString()}</p>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#97cba9] dark:text-[#7aab8a] group-hover:gap-3 transition-all duration-300">
          <span>View details</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </Link>
);

export default StatBox;