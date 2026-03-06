"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export const useAllProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([0, 1000]);
  const [priceStats, setPriceStats] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("default");
  const [showOnSale, setShowOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      } catch (error) {
        console.error("Failed to fetch price stats:", error);
        setPriceStats({ min: 0, max: 1000 });
        setPriceRange([0, 1000]);
        setTempPriceRange([0, 1000]);
      }
    };
    fetchPriceStats();
  }, []);

  useEffect(() => {
    if (currentPage !== 1) {
      router.push("?page=1", { scroll: false });
    }
  }, [priceRange, showOnSale, minRating, sortBy]);

  const clearAllFilters = () => {
    setPriceRange([priceStats.min, priceStats.max]);
    setTempPriceRange([priceStats.min, priceStats.max]);
    setShowOnSale(false);
    setMinRating(0);
    setSortBy("default");
  };

  const hasActiveFilters = () =>
    priceRange[0] !== priceStats.min ||
    priceRange[1] !== priceStats.max ||
    showOnSale ||
    minRating > 0 ||
    sortBy !== "default";

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    setTempPriceRange(newValue as number[]);
  };

  const handlePriceChangeCommitted = () => {
    setPriceRange(tempPriceRange);
    setShowMobileFilters(false);
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

  const applyManualPriceInput = () => handlePriceChangeCommitted();

  return {
    currentPage,
    priceRange, setPriceRange,
    tempPriceRange, setTempPriceRange,
    priceStats,
    sortBy, setSortBy,
    showOnSale, setShowOnSale,
    minRating, setMinRating,
    showFilters, setShowFilters,
    showMobileFilters, setShowMobileFilters,
    clearAllFilters,
    hasActiveFilters,
    handlePriceChange,
    handlePriceChangeCommitted,
    handleMinPriceInputChange,
    handleMaxPriceInputChange,
    applyManualPriceInput,
  };
};