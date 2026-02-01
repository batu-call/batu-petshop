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

interface AnalyticsData {
  weeklyActiveUsers: number;
  activeNow: number;
  todayRegisteredUsers: number;
  todayRegisteredAdmin: number;
  last7DaysLogin: { day: string; fullDate: string; users: number }[];
  lastSignup?: {
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  avgSessionMs: number;
}

// ─── Custom Tooltip ──────────────────────────────────────────────────
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { day: string; fullDate: string } }[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-[#97cba9]/30 rounded-2xl shadow-xl px-4 py-3 backdrop-blur-sm">
        <p className="text-sm font-bold text-[#2d5f4a]">{data.day}</p>
        <p className="text-xs text-gray-400 mb-1.5">{data.fullDate}</p>
        <p className="text-base text-[#97cba9] font-bold">
          {payload[0].value} <span className="text-xs font-medium text-gray-500">
            login{payload[0].value !== 1 ? "s" : ""}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ──────────────────────────────────────────────────
export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{
          success: boolean;
          data: AnalyticsData;
        }>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics`, {
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
    fetchAnalytics();
  }, []);

  // ─── Helpers ────────────────────────────────────────────────────
  const formatMs = (ms?: number) => {
    if (!ms) return "0s";
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const formatDateUS = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        No analytics data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-[#97cba9]/5 p-8">
      <div className="mb-12 animate-fadeIn">
        <div className="flex items-end gap-4 mb-2">
          <div className="w-2 h-12 bg-linear-to-b from-[#97cba9] to-[#5a9d7a] rounded-full" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#2d5f4a] to-[#97cba9]">
            Analytics Overview
          </h1>
        </div>
        <p className="text-gray-500 ml-6 font-medium">
          Real-time insights and performance metrics
        </p>
      </div>

      {/* ── Stats Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Weekly Active Users */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#97cba9]/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#97cba9]/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#97cba9] to-[#6db491] flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Last 7 Days
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.weeklyActiveUsers.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Active Users
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-[#97cba9] to-[#6db491] rounded-full transition-all duration-1000"
                style={{ width: '75%' }}
              />
            </div>
          </div>
        </div>

        {/* Currently Active */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#97cba9]/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-3 h-3 bg-white rounded-full animate-ping" />
                  <div className="relative w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Right Now
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.activeNow.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Online Now
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 animate-pulse"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </div>

        {/* Today Registered Users */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#97cba9]/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Today
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.todayRegisteredUsers.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                New Users
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: '45%' }}
              />
            </div>
          </div>
        </div>

        {/* Today Registered Admin */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#97cba9]/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {data.todayRegisteredAdmin.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                New Admins Today
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                style={{ width: '30%' }}
              />
            </div>
          </div>
        </div>

        {/* Latest Registered User */}
        <div className="group relative bg-linear-to-br from-[#97cba9] to-[#6db491] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Latest User
              </span>
            </div>
            {data.lastSignup ? (
              <div className="space-y-4">
                <p className="text-3xl font-black text-white">
                  {data.lastSignup.firstName} {data.lastSignup.lastName}
                </p>
                <div className="flex items-center gap-2 text-white/70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">
                    {formatDateUS(data.lastSignup.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-3xl font-black text-white">—</p>
            )}
          </div>
        </div>

        {/* Average Session */}
        <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#97cba9]/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Avg Duration
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-[#2d5f4a] tabular-nums">
                {formatMs(data.avgSessionMs)}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                Per Session
              </p>
            </div>
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                style={{ width: '55%' }}
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
              Last 7 Days Login Activity
            </h2>
          </div>
          <p className="text-gray-500 ml-6 text-sm font-medium">
            Daily login trends and user engagement patterns
          </p>
        </div>

        <div className="relative" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.last7DaysLogin}
              margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="day"
                stroke="#9ca3af"
                tick={{ 
                  fontSize: 13, 
                  fontWeight: 600,
                  fill: '#6b7280'
                }}
                axisLine={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                tickLine={false}
                dy={12}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ 
                  fontSize: 13, 
                  fontWeight: 600,
                  fill: '#6b7280'
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                dx={-12}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ 
                  fill: 'rgba(151, 203, 169, 0.1)',
                  radius: 8
                }}
              />
              <Bar
                dataKey="users"
                fill="url(#barGradient)"
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