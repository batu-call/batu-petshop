"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export const useAllProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([0, 1000]);
  const [priceStats, setPriceStats] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [priceStatsLoaded, setPriceStatsLoaded] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [showOnSale, setShowOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const fetchPriceStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/price-stats`,
        );
        const { min, max } = response.data;
        setPriceStats({ min, max });
        setPriceRange([min, max]);
        setTempPriceRange([min, max]);
        setPriceStatsLoaded(true);
      } catch (error) {
        console.error("Failed to fetch price stats:", error);
        setPriceStats({ min: 0, max: 1000 });
        setPriceRange([0, 1000]);
        setTempPriceRange([0, 1000]);
        setPriceStatsLoaded(true);
      }
    };
    fetchPriceStats();
  }, []);

  useEffect(() => {
    if (currentPage !== 1) {
      const params = new URLSearchParams();
      params.set("page", "1");
      if (search) params.set("search", search);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [priceRange, showOnSale, minRating, sortBy]);

  const buildParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    Object.entries(overrides).forEach(([k, v]) => params.set(k, v));
    return params.toString();
  };

  const clearAllFilters = () => {
    setIsClearing(true);
    setPriceRange([priceStats.min, priceStats.max]);
    setTempPriceRange([priceStats.min, priceStats.max]);
    setShowOnSale(false);
    setMinRating(0);
    setSortBy("default");
    router.replace("/AllProduct", { scroll: false });
  };

  const hasActiveFilters = () =>
    priceRange[0] !== priceStats.min ||
    priceRange[1] !== priceStats.max ||
    showOnSale ||
    minRating > 0 ||
    sortBy !== "default" ||
    !!search;

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    setTempPriceRange(newValue as number[]);
  };

  const handlePriceChangeCommitted = () => {
    setPriceRange(tempPriceRange);
    setShowMobileFilters(false);
  };

  const applyManualPriceInput = () => {
    setPriceRange(tempPriceRange);
  };

  const handleMinPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") { setTempPriceRange([0, tempPriceRange[1]]); return; }
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    setTempPriceRange([Math.max(0, numValue), tempPriceRange[1]]);
  };

  const handleMaxPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") { setTempPriceRange([tempPriceRange[0], 999999]); return; }
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    setTempPriceRange([tempPriceRange[0], Math.max(0, numValue)]);
  };

  return {
    currentPage,
    search,
    buildParams,
    priceRange, setPriceRange,
    tempPriceRange, setTempPriceRange,
    priceStats,
    priceStatsLoaded,
    sortBy, setSortBy,
    showOnSale, setShowOnSale,
    minRating, setMinRating,
    showFilters, setShowFilters,
    showMobileFilters, setShowMobileFilters,
    isClearing, setIsClearing,
    clearAllFilters,
    hasActiveFilters,
    handlePriceChange,
    handlePriceChangeCommitted,
    handleMinPriceInputChange,
    handleMaxPriceInputChange,
    applyManualPriceInput,
  };
};