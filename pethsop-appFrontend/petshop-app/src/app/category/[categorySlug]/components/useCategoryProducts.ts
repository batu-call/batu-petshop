"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import React from "react";
import { Product, ReviewStats } from "./types";

export const useCategoryProducts = (
  categorySlug: string,
  page: number,
  priceMin: number,
  priceMax: number,
  priceStats: { min: number; max: number },
  showOnSale: boolean,
  minRating: number,
  sortBy: string,
  subCategory: string | null,
) => {
  const [allProducts, setAllProducts]           = useState<Product[]>([]);
  const [totalPages, setTotalPages]             = useState(1);
  const [totalProducts, setTotalProducts]       = useState(0);
  const [filteredProducts, setFilteredProducts] = useState(0);
  const [loading, setLoading]                   = useState(true);
  const [reviewStats, setReviewStats]           = useState<ReviewStats>({});
  const categoryTotalRef                        = useRef(0);

  useEffect(() => {
    categoryTotalRef.current = 0;
  }, [categorySlug]);

  useEffect(() => {
    if (!categorySlug) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { category: categorySlug, page, sortBy };

        if (priceMin !== priceStats.min || priceMax !== priceStats.max) {
          params.minPrice = priceMin;
          params.maxPrice = priceMax;
        }

        if (showOnSale)    params.onSale      = true;
        if (minRating > 0) params.minRating   = minRating;
        if (subCategory)   params.subCategory = subCategory;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
          { params, signal: controller.signal },
        );

        const fetched = res.data.filteredProducts || 0;

        const isBaseQuery =
          !showOnSale &&
          minRating === 0 &&
          priceMin === priceStats.min &&
          priceMax === priceStats.max &&
          !subCategory;

        if (isBaseQuery) {
          categoryTotalRef.current = fetched;
        }

        setAllProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setFilteredProducts(fetched);
        setTotalProducts(categoryTotalRef.current || fetched);
      } catch (err) {
        if (axios.isCancel(err)) return;
        toast.error("Products could not be loaded");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 80);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [categorySlug, page, priceMin, priceMax, priceStats.min, priceStats.max, showOnSale, minRating, sortBy, subCategory]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviewStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`,
          { signal: controller.signal },
        );
        setReviewStats(response.data.stats);
      } catch (err) {
        if (axios.isCancel(err)) return;
        toast.error("Failed to load reviews");
      }
    };

    fetchReviewStats();

    return () => controller.abort();
  }, []);

  const displayProducts = React.useMemo(() => {
    if (sortBy !== "default") return allProducts;

    return [...allProducts].sort((a, b) => {
      const aFeatured = a.isFeatured ? 1 : 0;
      const bFeatured = b.isFeatured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;

      const aStock    = Number(a.stock ?? 0);
      const bStock    = Number(b.stock ?? 0);
      const aLowStock = aStock > 0 && aStock < 6;
      const bLowStock = bStock > 0 && bStock < 6;
      if (aLowStock && !bLowStock) return -1;
      if (!aLowStock && bLowStock) return 1;

      const aDiscount = a.salePrice && a.salePrice < a.price;
      const bDiscount = b.salePrice && b.salePrice < b.price;
      if (aDiscount && !bDiscount) return -1;
      if (!aDiscount && bDiscount) return 1;

      return 0;
    });
  }, [allProducts, sortBy]);

  return { displayProducts, totalPages, totalProducts, filteredProducts, loading, reviewStats };
};