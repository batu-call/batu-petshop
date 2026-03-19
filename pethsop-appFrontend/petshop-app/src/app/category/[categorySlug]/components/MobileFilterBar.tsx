"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Slider from "@mui/material/Slider";
import { ChevronDown, ChevronUp, DollarSign, Filter, X } from "lucide-react";

type Props = {
  showMobileFilters: boolean;
  setShowMobileFilters: (v: boolean) => void;
  filteredProducts: number;
  totalProducts: number;
  hasActiveFilters: () => boolean;
  clearAllFilters: () => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  sortOptions: { value: string; label: string }[];
  tempPriceRange: number[];
  priceStats: { min: number; max: number };
  handlePriceChange: (_: Event, newValue: number | number[]) => void;
  handlePriceChangeCommitted: () => void;
  showOnSale: boolean;
  setShowOnSale: (v: boolean) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  setPriceRange: (r: number[]) => void;
  setTempPriceRange: (r: number[]) => void;
};

const MobileFilterBar = ({
  showMobileFilters,
  setShowMobileFilters,
  filteredProducts,
  totalProducts,
  hasActiveFilters,
  clearAllFilters,
  sortBy,
  setSortBy,
  sortOptions,
  tempPriceRange,
  priceStats,
  handlePriceChange,
  handlePriceChangeCommitted,
  showOnSale,
  setShowOnSale,
  minRating,
  setMinRating,
  setPriceRange,
  setTempPriceRange,
}: Props) => {
  const [minInput, setMinInput] = useState(String(tempPriceRange[0]));
  const [maxInput, setMaxInput] = useState(String(tempPriceRange[1]));

  useEffect(() => {
    setMinInput(String(tempPriceRange[0]));
    setMaxInput(String(tempPriceRange[1]));
  }, [tempPriceRange]);

  const applyPriceInputs = () => {
    const rawMin = parseFloat(minInput);
    const rawMax = parseFloat(maxInput);

    const min = isNaN(rawMin)
      ? priceStats.min
      : Math.max(priceStats.min, Math.min(rawMin, priceStats.max));
    const max = isNaN(rawMax)
      ? priceStats.max
      : Math.max(priceStats.min, Math.min(rawMax, priceStats.max));

    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);

    setMinInput(String(safeMin));
    setMaxInput(String(safeMax));
    setTempPriceRange([safeMin, safeMax]);
    setPriceRange([safeMin, safeMax]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyPriceInputs();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 md:hidden">
        <div className="text-sm text-gray-700 dark:text-[#a8d4b8]">
          Showing{" "}
          <span className="text-primary dark:text-[#a8d4b8]! font-bold">
            {filteredProducts}
          </span>{" "}
          of{" "}
          <span className="text-primary dark:text-[#c8e6d0] font-bold">
            {totalProducts}
          </span>{" "}
          products
          {hasActiveFilters() && (
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] ml-1">
              (filtered)
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer"
        >
          <Filter size={16} />
          <span>Filter</span>
          {hasActiveFilters() && (
            <span className="bg-secondary text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
          {showMobileFilters ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </Button>
      </div>

      {showMobileFilters && (
        <div className="md:hidden bg-white dark:bg-[#162820] rounded-2xl shadow-2xl border-2 border-primary/20 dark:border-[#2d5a3d] p-4 mb-4 z-40 max-w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary dark:text-[#7aab8a] font-bold text-lg">
              <Filter size={20} />
              <span>Filters & Sort</span>
            </div>
            {hasActiveFilters() && (
              <Button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setShowMobileFilters(false);
                }}
                className="bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] text-xs px-3 py-1.5 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
              >
                <X size={14} className="mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-primary dark:text-[#7aab8a] mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/30 dark:border-[#2d5a3d] bg-white dark:bg-[#0d1f18] text-primary dark:text-[#c8e6d0] font-medium focus:outline-none focus:border-primary dark:focus:border-[#7aab8a] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2d5a3d] transition-all"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-primary dark:text-[#7aab8a] flex items-center gap-2 mb-2">
              <DollarSign size={16} />
              Price: ${tempPriceRange[0]} - ${tempPriceRange[1]}
            </label>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-[#7aab8a] mb-1">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#7aab8a] text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    onBlur={applyPriceInputs}
                    onKeyDown={handleKeyDown}
                    min={priceStats.min}
                    max={priceStats.max}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-primary/30 dark:border-[#2d5a3d] bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] focus:border-primary dark:focus:border-[#7aab8a] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2d5a3d] transition-all outline-none"
                  />
                </div>
              </div>
              <div className="text-gray-400 dark:text-[#7aab8a] font-bold pt-5">
                —
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-[#7aab8a] mb-1">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#7aab8a] text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    onBlur={applyPriceInputs}
                    onKeyDown={handleKeyDown}
                    min={priceStats.min}
                    max={priceStats.max}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-primary/30 dark:border-[#2d5a3d] bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] focus:border-primary dark:focus:border-[#7aab8a] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2d5a3d] transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={applyPriceInputs}
              className="w-full mb-3 bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97]"
            >
              Apply Price
            </Button>

            <Slider
              value={tempPriceRange}
              onChange={handlePriceChange}
              onChangeCommitted={handlePriceChangeCommitted}
              valueLabelDisplay="auto"
              min={priceStats.min}
              max={priceStats.max}
              sx={{
                color: "#57B394",
                height: 8,
                "& .MuiSlider-thumb": {
                  width: 20,
                  height: 20,
                  backgroundColor: "#fff",
                  border: "3px solid #57B394",
                },
                "& .MuiSlider-track": {
                  backgroundColor: "#57B394",
                  borderColor: "#57B394",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "#d1d5db",
                  opacity: 0.5,
                },
              }}
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-[#7aab8a] mt-1">
              <span>${priceStats.min}</span>
              <span>${priceStats.max}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnSale}
                onChange={(e) => setShowOnSale(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-primary/30 dark:border-[#2d5a3d] text-primary"
              />
              <span className="text-sm font-medium text-primary dark:text-[#7aab8a]">
                Show Only On Sale
              </span>
            </label>

            <div>
              <label className="block text-sm font-semibold text-primary dark:text-[#7aab8a] mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    type="button"
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      minRating === rating
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-white dark:bg-[#1e3d2a] text-primary dark:text-[#7aab8a] border border-primary/30 dark:border-[#2d5a3d] hover:scale-105"
                    }`}
                  >
                    {rating === 0 ? "All" : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilterBar;
