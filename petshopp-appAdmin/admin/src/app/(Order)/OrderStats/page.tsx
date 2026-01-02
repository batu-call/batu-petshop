"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import CircularText from "@/components/CircularText";

interface OrderStatsData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyStats: { month: string; orders: number; revenue: number }[];
}

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

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      </>
    );
  }

  if (!data) return <div className="ml-40 mt-10">No order stats found.</div>;

  const barChartData = data.monthlyStats;

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:ml-24 lg:ml-40 mt-6 p-4">
        {/* Stat Cards */}
        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography
                variant="h6"
                className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs"
              >
                Total Orders
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">{data.totalOrders}</p>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography
                variant="h6"
                className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs"
              >
                Pending Orders
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">
              {data.pendingOrders}
            </p>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography
                variant="h6"
                className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs"
              >
                Completed Orders
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">
              {data.completedOrders}
            </p>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#A8D1B5" }}>
          <CardHeader
            title={
              <Typography
                variant="h6"
                className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs"
              >
                Cancelled Orders
              </Typography>
            }
          />
          <CardContent>
            <p className="text-2xl font-bold text-color">
              {data.cancelledOrders}
            </p>
          </CardContent>
        </Card>

        {/* BarChart */}
        <Card className="md:col-span-2 lg:col-span-3 h-72">
          <CardHeader
            title={
              <Typography
                variant="h6"
                className="text-white bg-primary inline-block p-2 rounded-sm text-shadow-2xs"
              >
                Monthly Orders (Last 6 Months)
              </Typography>
            }
          />
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 40, right: 40, left: 40, bottom: 60 }}
              >
                <XAxis
                  dataKey="month"
                  stroke="#4B5563"
                  tick={{ fill: "#4B5563", fontSize: 12 }}
                  tickFormatter={(monthStr) => {
                    const [year, month] = monthStr.split("-");
                    const date = new Date(Number(year), Number(month) - 1);
                    return date.toLocaleString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                  }}
                />
                <YAxis stroke="#4B5563" />
                <Tooltip
                  cursor={{ fill: "rgba(168, 209, 181, 0.3)" }}
                  labelFormatter={(label) => `Month: ${label}`}
                  formatter={(value?: number) => [
                    `${value ?? 0} orders`,
                    "Orders",
                  ]}
                />
                <Bar
                  dataKey="orders"
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
