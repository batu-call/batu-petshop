"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export interface ProductStatsData {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  totalSold: number;
  newThisMonth: number;
  categoryData: { name: string; count: number }[];
  featuredProductsList: { _id: string; product_name: string; slug: string }[];
}

export const useProductStats = () => {
  const [data, setData] = useState<ProductStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ success: boolean; data: ProductStatsData }>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/stats`,
          { withCredentials: true },
        );
        setData(response.data.data);
      } catch (error) {
        console.error("Product stats fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { data, loading, mounted };
};