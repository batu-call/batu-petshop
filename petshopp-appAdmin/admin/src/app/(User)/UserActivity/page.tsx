"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import CircularText from "@/components/CircularText";

interface AnalyticsData {
  weeklyActiveUsers: number;
  activeNow: number;
  todayRegisteredUsers: number;
  todayRegisteredAdmin: number;
  last7DaysLogin: { day: string; users: number }[];
  lastSignup?: {
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  avgSessionMs: number;
}

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true); 
      try {
        const response = await axios.get<{ success: boolean; data: AnalyticsData }>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics`,
          { withCredentials: true }
        );
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
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      </>
    );
  }

  if (!data) return <div className="ml-40 mt-10">No analytics data found.</div>;

  const barChartData = data.last7DaysLogin;

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:ml-24 lg:ml-40 mt-6 p-4">

        {/* Stat Cards */}
        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography variant="h6" className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs">
                Users Active Last 7 Days
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">{data.weeklyActiveUsers}</p>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography variant="h6" className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs">
                Currently Active Users
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">{data.activeNow}</p>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography variant="h6" className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs">
                Users Registered Today
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">{data.todayRegisteredUsers}</p>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography variant="h6" className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs">
                Admin Registered Today
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">{data.todayRegisteredAdmin}</p>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography variant="h6" className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs">
                Latest Registered User
              </Typography>
            }
          />
          <CardContent>
            {data.lastSignup ? (
              <>
                <p className="text-lg font-semibold text-color">
                  First Name: {data.lastSignup?.firstName} &nbsp; | &nbsp; Last Name: {data.lastSignup?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDateUS(data.lastSignup?.createdAt)}
                </p>
              </>
            ) : (
              <p>—</p>
            )}
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography variant="h6" className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs">
                Average Session Duration
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">{formatMs(data.avgSessionMs)}</p>
          </CardContent>
        </Card>

        {/* BarChart */}
        <Card className="md:col-span-2 lg:col-span-3 h-72">
          <CardHeader
            title={
              <Typography variant="h6" className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs">
                Last 7 Days Login Activity
              </Typography>
            }
          />
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="day" stroke="#4B5563" />
                <YAxis stroke="#4B5563" />
                <Tooltip
                  cursor={{ fill: "rgba(168, 209, 181, 0.3)" }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value?: number) => [
                    `${value ?? 0} login`,
                    "Login",
                  ]}
                />
                <Bar
                  dataKey="users"
                  fill="#A8D1B5"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
