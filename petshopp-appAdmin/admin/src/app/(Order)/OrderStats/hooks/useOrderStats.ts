"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export interface OrderStatsData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyStats: { month: string; orders: number; revenue: number }[];
}

export const useOrderStats = () => {
  const [data, setData] = useState<OrderStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ success: boolean; data: OrderStatsData }>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/stats`,
          { withCredentials: true },
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
    fetchStats();
  }, []);

  return { data, loading, mounted };
};