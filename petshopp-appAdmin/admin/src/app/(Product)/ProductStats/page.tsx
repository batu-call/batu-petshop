"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CircularText from "@/components/CircularText";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#97cba9",
  "#6db491",
  "#5a9d7a",
  "#2d5f4a",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
];

// ─── Types ───────────────────────────────────────────────────────────
interface ProductStatsData {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  totalSold: number;
  newThisMonth: number;
  categoryData: { name: string; count: number }[];
  featuredProductsList: {
    _id: string;
    product_name: string;
    slug: string;
  }[];
}

// ─── Custom Tooltip for Pie Chart ────────────────────────────────────
interface CustomPieTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

const CustomPieTooltip: React.FC<CustomPieTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-[#97cba9]/30 rounded-2xl shadow-xl px-4 py-3 backdrop-blur-sm">
        <p className="text-sm font-bold text-[#2d5f4a]">{payload[0].name}</p>
        <p className="text-base text-[#97cba9] font-bold mt-1">
          {payload[0].value}{" "}
          <span className="text-xs font-medium text-gray-500">
            product{payload[0].value !== 1 ? "s" : ""}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────
const Page = () => {
  const [data, setData] = useState<ProductStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ IMPROVED: Single API call instead of 2 separate calls
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{
          success: boolean;
          data: ProductStatsData;
        }>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/stats`, {
          withCredentials: true,
        });

        setData(response.data.data);
      } catch (error) {
        console.error("Product stats fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-linear-to-br from-[#97cba9] to-[#5a9d7a] z-50">
        <CircularText
          text="LOADING"
          spinDuration={20}
          className="text-white text-4xl"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ml-40 mt-10 text-gray-500">
        No product stats found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-[#97cba9]/5 p-8">
      {/* ── Header Section ───────────────────────────────────── */}
      <div className="mb-12 animate-fadeIn">
        <div className="flex items-end gap-4 mb-2">
          <div className="w-2 h-12 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9]">
            Product Analytics
          </h1>
        </div>
        <p className="text-gray-500 ml-6 font-medium">
          Track inventory, categories and product performance
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── LEFT: PIE CHART & FEATURED ────────────────────── */}
        <div className="space-y-6">
          {/* Pie Chart Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-2 h-6 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9]">
                  Product Distribution by Category
                </h2>
              </div>
              <p className="text-gray-500 ml-6 text-sm font-medium">
                Category breakdown and inventory distribution
              </p>
            </div>

            <div className="w-full h-[350px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    dataKey="count"
                    nameKey="name"
                    outerRadius={120}
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={true}
                  >
                    {data.categoryData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Featured Products Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-[#2d5f4a]">
                  Featured Products
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {data.featuredProducts} products featured
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#97cba9] to-[#6db491] flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            </div>

            {data.featuredProductsList.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 italic">
                  No featured products yet
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.featuredProductsList.map((p, idx) => (
                  <li key={p._id} className="group">
                    <Link
                      href={`/Products/${p.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#97cba9]/5 transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#97cba9]/20 to-[#6db491]/20 flex items-center justify-center text-sm font-bold text-[#2d5f4a]">
                        {idx + 1}
                      </div>
                      <span className="flex-1 text-sm font-semibold text-gray-700 group-hover:text-[#2d5f4a] transition-colors line-clamp-1">
                        {p.product_name}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-[#97cba9] transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── RIGHT: STATS GRID ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 h-fit">
          <StatBox
            title="Total Products"
            value={data.totalProducts}
            href="/AllProduct?page=1"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
            gradient="from-[#97cba9] to-[#6db491]"
          />
          <StatBox
            title="In Stock"
            value={data.inStock}
            href="/AllProduct?page=1&minStock=1"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            gradient="from-emerald-400 to-emerald-600"
          />
          <StatBox
            title="Out of Stock"
            value={data.outOfStock}
            href="/AllProduct?page=1&maxStock=0"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            gradient="from-red-400 to-red-600"
          />
          <StatBox
            title="Sold Products"
            value={data.totalSold}
            href="/AllOrders?page=1"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            }
            gradient="from-blue-400 to-blue-600"
          />
          <StatBox
            title="New This Month"
            value={data.newThisMonth}
            href="/AllProduct?page=1"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
            gradient="from-purple-400 to-purple-600"
          />
          <StatBox
            title="Active Products"
            value={data.activeProducts}
            href="/AllProduct?page=1&isActive=true"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            gradient="from-amber-400 to-amber-600"
          />
          <StatBox
            title="Inactive Products"
            value={data.inactiveProducts}
            href="/AllProduct?page=1&isActive=false"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            }
            gradient="from-gray-400 to-gray-600"
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

// ─── Stat Box Component ──────────────────────────────────────────────
const StatBox = ({
  title,
  value,
  href,
  icon,
  gradient,
}: {
  title: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}) => (
  <Link href={href}>
    <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#97cba9]/30 overflow-hidden cursor-pointer">
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#97cba9]/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

      <div className="relative">
        <div
          className={`w-12 h-12 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-white">{icon}</div>
        </div>

        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </p>

        <p className="text-4xl font-black text-[#2d5f4a] tabular-nums">
          {value.toLocaleString()}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#97cba9] group-hover:gap-3 transition-all duration-300">
          <span>View details</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  </Link>
);

export default Page;