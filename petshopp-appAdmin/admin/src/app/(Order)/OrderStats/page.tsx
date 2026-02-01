"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import CircularText from "@/components/CircularText";

interface OrderStatsData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyStats: { month: string; orders: number; revenue: number }[];
}

// ─── Custom Tooltip ──────────────────────────────────────────────────
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    payload: { month: string; orders: number; revenue: number };
  }[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const [year, month] = data.month.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    const monthName = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="bg-white border-2 border-[#97cba9]/30 rounded-2xl shadow-xl px-4 py-3 backdrop-blur-sm">
        <p className="text-sm font-bold text-[#2d5f4a] mb-1">{monthName}</p>
        <p className="text-base text-[#97cba9] font-bold">
          {data.orders}{" "}
          <span className="text-xs font-medium text-gray-500">
            order{data.orders !== 1 ? "s" : ""}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Revenue:{" "}
          <span className="font-bold">${data.revenue.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────
export default function OrderStats() {
  const [data, setData] = useState<OrderStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{
          success: boolean;
          data: OrderStatsData;
        }>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/stats`, {
          withCredentials: true,
        });
        setData(response.data.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong!");
        }
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
      <div className="ml-40 mt-10 text-gray-500">No order stats found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-[#97cba9]/5 p-8">
      {/* ── Header Section ───────────────────────────────────── */}
      <div className="mb-12 animate-fadeIn">
        <div className="flex items-end gap-4 mb-2">
          <div className="w-2 h-12 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9]">
            Order Statistics
          </h1>
        </div>
        <p className="text-gray-500 ml-6 font-medium">
          Track orders, revenue and performance metrics
        </p>
      </div>

      {/* ── Stats Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Orders */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#97cba9]/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#97cba9]/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                All Time
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.totalOrders.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Total Orders
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#97cba9] to-[#6db491] rounded-full transition-all duration-1000"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-400/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Waiting
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.pendingOrders.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Pending Orders
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((data.pendingOrders / data.totalOrders) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-400/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Success
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.completedOrders.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Completed Orders
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((data.completedOrders / data.totalOrders) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-red-400/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-red-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
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
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Failed
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.cancelledOrders.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Cancelled Orders
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((data.cancelledOrders / data.totalOrders) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bar Chart ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 overflow-hidden">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-2 h-8 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9]">
              Monthly Orders (Last 6 Months)
            </h2>
          </div>
          <p className="text-gray-500 ml-6 text-sm font-medium">
            Order volume and revenue trends over time
          </p>
        </div>

        <div className="relative" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlyStats}
              margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="orderBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#97cba9" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6db491" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                tick={{
                  fontSize: 13,
                  fontWeight: 600,
                  fill: "#6b7280",
                }}
                axisLine={{ stroke: "#e5e7eb", strokeWidth: 2 }}
                tickLine={false}
                dy={12}
                tickFormatter={(monthStr) => {
                  const [year, month] = monthStr.split("-");
                  const date = new Date(Number(year), Number(month) - 1);
                  return date.toLocaleString("en-US", {
                    month: "short",
                  });
                }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{
                  fontSize: 13,
                  fontWeight: 600,
                  fill: "#6b7280",
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                dx={-12}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "rgba(151, 203, 169, 0.1)",
                  radius: 8,
                }}
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
}
