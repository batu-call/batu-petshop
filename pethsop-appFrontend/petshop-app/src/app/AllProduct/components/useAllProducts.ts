"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import React from "react";

type ReviewStats = {
  [productId: string]: { count: number; avgRating: number };
};

type ProductImage = { url: string; publicId: string; _id: string };

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stock: string;
  image: ProductImage[];
  slug: string;
};

export const useAllProducts = (
  currentPage: number,
  priceMin: number,
  priceMax: number,
  priceStats: { min: number; max: number },
  showOnSale: boolean,
  minRating: number,
  sortBy: string,
  search: string,
  priceStatsLoaded: boolean,
) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});

  useEffect(() => {
    if (!priceStatsLoaded) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params: any = { page: currentPage, sortBy };

        if (priceMin !== priceStats.min || priceMax !== priceStats.max) {
          params.minPrice = priceMin;
          params.maxPrice = priceMax;
        }

        if (showOnSale) params.onSale = true;
        if (minRating > 0) params.minRating = minRating;
        if (search) params.search = search;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
          { params },
        );

        if (response.data.success) {
          setAllProducts(response.data.products);
          setTotalPages(response.data.totalPages);
          setTotalProducts(response.data.filteredProducts || 0);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [currentPage, priceMin, priceMax, priceStats.min, priceStats.max, showOnSale, minRating, sortBy, search, priceStatsLoaded]);

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`);
        setReviewStats(response.data.stats);
      } catch {
        toast.error("Failed to load reviews");
      }
    };
    fetchReviewStats();
  }, []);

  const displayProducts = React.useMemo(() => {
    if (sortBy !== "default") return allProducts;

    return [...allProducts].sort((a, b) => {
      const aStock = Number(a.stock ?? 0);
      const bStock = Number(b.stock ?? 0);
      const aLowStock = aStock > 0 && aStock < 5;
      const bLowStock = bStock > 0 && bStock < 5;
      if (aLowStock && !bLowStock) return -1;
      if (!aLowStock && bLowStock) return 1;

      const aDiscount = a.salePrice && a.salePrice < a.price;
      const bDiscount = b.salePrice && b.salePrice < b.price;
      if (aDiscount && !bDiscount) return -1;
      if (!aDiscount && bDiscount) return 1;

      return 0;
    });
  }, [allProducts, sortBy]);

  return { displayProducts, totalPages, totalProducts, loading, reviewStats };
};