"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Slider from "@mui/material/Slider";
import { DollarSign, Filter, X } from "lucide-react";
import { SORT_OPTIONS } from "./navbarTypes";

type Props = {
  sortBy?: string;
  setSortBy?: (v: string) => void;
  priceStats?: { min: number; max: number };
  tempPriceRange?: number[];
  setTempPriceRange?: (r: number[]) => void;
  setPriceRange?: (r: number[]) => void;
  handleMinPriceInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxPriceInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applyManualPriceInput: () => void;
  handlePriceChange?: (event: Event, newValue: number | number[]) => void;
  handlePriceChangeCommitted?: () => void;
  showOnSale?: boolean;
  setShowOnSale?: (v: boolean) => void;
  minRating?: number;
  setMinRating?: (v: number) => void;
  hasActiveFilters?: () => boolean;
  clearAllFilters?: () => void;
  setShowFilters?: (v: boolean) => void;
  filterDropdownRef: React.RefObject<HTMLDivElement | null>;
};

const NavbarFilterDropdown = ({
  sortBy,
  setSortBy,
  priceStats,
  tempPriceRange,
  setTempPriceRange,
  setPriceRange,
  handlePriceChange,
  handlePriceChangeCommitted,
  showOnSale,
  setShowOnSale,
  minRating,
  setMinRating,
  hasActiveFilters,
  clearAllFilters,
  setShowFilters,
  filterDropdownRef,
}: Props) => {
  const [minInput, setMinInput] = useState(String(tempPriceRange?.[0] ?? ""));
  const [maxInput, setMaxInput] = useState(String(tempPriceRange?.[1] ?? ""));

  useEffect(() => {
    if (tempPriceRange) {
      setMinInput(String(tempPriceRange[0]));
      setMaxInput(String(tempPriceRange[1]));
    }
  }, [tempPriceRange]);

  const applyPriceInputs = () => {
    if (!priceStats || !setTempPriceRange || !setPriceRange) return;

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
    <div
      ref={filterDropdownRef}
      className="fixed top-12 right-2 w-[calc(100vw-1rem)] sm:w-80 md:w-96 lg:w-[28rem]
        bg-white dark:bg-[#162820]
        rounded-2xl shadow-2xl
        border-2 border-primary/20 dark:border-[#2d5a3d]
        p-4 sm:p-6 z-50
        max-h-[calc(100vh-5rem)] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-[#162820] pb-2 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2 text-primary dark:text-[#7aab8a] font-bold text-lg">
          <Filter size={20} />
          <span>Filters & Sort</span>
        </div>
        {hasActiveFilters && hasActiveFilters() && clearAllFilters && (
          <Button
            onClick={() => {
              clearAllFilters();
              if (setShowFilters) setShowFilters(false);
            }}
            className="bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] text-xs px-3 py-1.5 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
          >
            <X size={14} className="mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {setSortBy && sortBy !== undefined && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-primary dark:text-[#7aab8a] mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/30 dark:border-[#2d5a3d]
              bg-white dark:bg-[#0d1f18]
              text-primary dark:text-[#c8e6d0]
              font-medium focus:outline-none
              focus:border-primary dark:focus:border-[#7aab8a]
              focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2d5a3d]
              transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      )}

      {priceStats && tempPriceRange && setTempPriceRange && handlePriceChange && (
        <div className="mb-4">
          <label className="text-sm font-semibold text-primary dark:text-[#7aab8a] flex items-center gap-2 mb-3">
            <DollarSign size={16} />
            Price Range: ${tempPriceRange[0]} - ${tempPriceRange[1]}
          </label>

          <div className="flex items-end gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-[#7aab8a] mb-1 font-medium">Min Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#7aab8a] text-sm">$</span>
                <input
                  type="number"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  onBlur={applyPriceInputs}
                  onKeyDown={handleKeyDown}
                  min={priceStats.min}
                  max={priceStats.max}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg
                    border-2 border-primary/30 dark:border-[#2d5a3d]
                    bg-white dark:bg-[#0d1f18]
                    text-gray-900 dark:text-[#c8e6d0]
                    focus:border-primary dark:focus:border-[#7aab8a]
                    focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2d5a3d]
                    transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div className="text-gray-400 dark:text-[#7aab8a] font-bold pb-2.5">—</div>

            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-[#7aab8a] mb-1 font-medium">Max Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#7aab8a] text-sm">$</span>
                <input
                  type="number"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  onBlur={applyPriceInputs}
                  onKeyDown={handleKeyDown}
                  min={priceStats.min}
                  max={priceStats.max}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg
                    border-2 border-primary/30 dark:border-[#2d5a3d]
                    bg-white dark:bg-[#0d1f18]
                    text-gray-900 dark:text-[#c8e6d0]
                    focus:border-primary dark:focus:border-[#7aab8a]
                    focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2d5a3d]
                    transition-all outline-none font-medium"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={applyPriceInputs}
            className="w-full mb-3 bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97]"
          >
            Apply Price
          </Button>

          <div className="px-1">
            <Slider
              value={tempPriceRange}
              onChange={handlePriceChange}
              onChangeCommitted={() => {
                if (setPriceRange) setPriceRange(tempPriceRange);
                if (handlePriceChangeCommitted) handlePriceChangeCommitted();
              }}
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
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(87, 179, 148, 0.16)",
                  },
                },
                "& .MuiSlider-track": { backgroundColor: "#57B394", borderColor: "#57B394" },
                "& .MuiSlider-rail": { backgroundColor: "#d1d5db", opacity: 0.5 },
                "& .MuiSlider-valueLabelOpen": { backgroundColor: "#57B394" },
              }}
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-[#7aab8a] mt-2 font-medium">
              <span>${priceStats.min}</span>
              <span>${priceStats.max}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {setShowOnSale !== undefined && showOnSale !== undefined && (
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e3d2a] transition-colors">
            <input
              type="checkbox"
              checked={showOnSale}
              onChange={(e) => setShowOnSale(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-primary/30 dark:border-[#2d5a3d] text-primary cursor-pointer focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-sm font-semibold text-primary dark:text-[#7aab8a]">Show Only On Sale</span>
          </label>
        )}

        {setMinRating !== undefined && minRating !== undefined && (
          <div>
            <label className="block text-sm font-semibold text-primary dark:text-[#7aab8a] mb-3">Minimum Rating</label>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    minRating === rating
                      ? "bg-primary text-white shadow-md scale-105"
                      : "bg-white dark:bg-[#1e3d2a] text-primary dark:text-[#7aab8a] border-2 border-primary/30 dark:border-[#2d5a3d] hover:scale-105 hover:border-primary/50 dark:hover:border-[#7aab8a]"
                  }`}
                >
                  {rating === 0 ? "All" : `${rating}★`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarFilterDropdown;