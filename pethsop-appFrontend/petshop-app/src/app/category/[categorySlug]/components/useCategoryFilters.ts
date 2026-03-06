"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";

export const useCategoryFilters = (page: number) => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [subCategory, setSubCategory] = useState<string | null>(
    searchParams.get("sub")
  );

  const [priceRange, setPriceRange]             = useState<number[]>([0, 1000]);
  const [tempPriceRange, setTempPriceRange]     = useState<number[]>([0, 1000]);
  const [priceStats, setPriceStats]             = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [sortBy, setSortBy]                     = useState("default");
  const [showOnSale, setShowOnSale]             = useState(false);
  const [minRating, setMinRating]               = useState(0);
  const [showFilters, setShowFilters]           = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const prevCategorySlug = useRef<string | undefined>(undefined);

  useEffect(() => {
    const sub = searchParams.get("sub");
    setSubCategory(sub);
  }, [searchParams]);

  useEffect(() => {
    if (prevCategorySlug.current !== undefined && prevCategorySlug.current !== categorySlug) {
      setSortBy("default");
      setShowOnSale(false);
      setMinRating(0);
      setSubCategory(null);
    }
    prevCategorySlug.current = categorySlug;
  }, [categorySlug]);

  useEffect(() => {
    if (!categorySlug) return;

    const fetchPriceStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/price-stats`,
          { params: { category: categorySlug } },
        );
        const { min, max } = response.data;
        setPriceStats({ min, max });
        setPriceRange([min, max]);
        setTempPriceRange([min, max]);
      } catch {
        setPriceStats({ min: 0, max: 1000 });
        setPriceRange([0, 1000]);
        setTempPriceRange([0, 1000]);
      }
    };

    fetchPriceStats();
  }, [categorySlug]);

  useEffect(() => {
    if (page !== 1) {
      const sub = searchParams.get("sub");
      const subParam = sub ? `&sub=${sub}` : "";
      router.push(`/category/${categorySlug}?page=1${subParam}`, { scroll: false });
    }
  }, [priceRange, showOnSale, minRating, sortBy]);

  useEffect(() => {
    if (page !== 1) {
      const sub = searchParams.get("sub");
      const subParam = sub ? `&sub=${sub}` : "";
      router.push(`/category/${categorySlug}?page=1${subParam}`, { scroll: false });
    }
  }, [subCategory]);

  const clearAllFilters = () => {
    setPriceRange([priceStats.min, priceStats.max]);
    setTempPriceRange([priceStats.min, priceStats.max]);
    setShowOnSale(false);
    setMinRating(0);
    setSortBy("default");
    setSubCategory(null);
    router.push(`/category/${categorySlug}`, { scroll: false });
  };

  const hasActiveFilters = () =>
    priceRange[0] !== priceStats.min ||
    priceRange[1] !== priceStats.max ||
    showOnSale ||
    minRating > 0 ||
    sortBy !== "default" ||
    subCategory !== null;

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    setTempPriceRange(newValue as number[]);
  };

  const handlePriceChangeCommitted = () => {
    setPriceRange(tempPriceRange);
    setShowMobileFilters(false);
  };

  const handleMinPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") { setTempPriceRange([priceStats.min, tempPriceRange[1]]); return; }
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    setTempPriceRange([Math.max(priceStats.min, Math.min(numValue, tempPriceRange[1])), tempPriceRange[1]]);
  };

  const handleMaxPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") { setTempPriceRange([tempPriceRange[0], priceStats.max]); return; }
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    setTempPriceRange([tempPriceRange[0], Math.min(priceStats.max, Math.max(numValue, tempPriceRange[0]))]);
  };

  const applyManualPriceInput = () => handlePriceChangeCommitted();

  return {
    categorySlug,
    subCategory, setSubCategory,
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