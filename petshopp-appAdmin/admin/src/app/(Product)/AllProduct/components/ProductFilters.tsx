"use client";

import { Filter, ChevronDown, Star, Trash2, Tag } from "lucide-react";
import { useState } from "react";
import { Filters } from "./useAdminProducts";

type Props = {
  localFilter: Filters;
  setLocalFilter: (f: Filters) => void;
  appliedFilter: Filters;
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
  toggleFeatured: (val: string) => void;
  filteredProducts: number;
  totalProducts: number;
};

const INPUT_CLASS =
  "border border-gray-300 dark:border-[#2d5a3d] p-2 rounded bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-1 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] [&>option]:bg-white dark:[&>option]:bg-[#1e3d2a] [&>option]:text-gray-900 dark:[&>option]:text-[#c8e6d0]";

const ProductFilters = ({
  localFilter,
  setLocalFilter,
  appliedFilter,
  hasActiveFilters,
  clearFilters,
  toggleFeatured,
  filteredProducts,
  totalProducts,
}: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const set = (key: keyof Filters, value: string) =>
    setLocalFilter({ ...localFilter, [key]: value });

  const toggleOnSale = () =>
    setLocalFilter({
      ...localFilter,
      onSale: localFilter.onSale === "true" ? "" : "true",
    });

  const featuredButtons = (size: "sm" | "lg") => (
    <div className={`flex gap-2 ${size === "lg" ? "items-center" : ""}`}>
      {size === "lg" && (
        <span className="text-sm font-semibold text-gray-600 dark:text-[#a8d4b8] flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-400" /> Featured:
        </span>
      )}
      <button
        onClick={() => toggleFeatured("true")}
        className={`flex items-center gap-1.5 px-4 ${size === "lg" ? "py-1.5" : "py-2"} rounded-lg text-sm font-semibold border transition-all duration-200 cursor-pointer ${
          localFilter.isFeatured === "true"
            ? "bg-yellow-400 border-yellow-400 text-white shadow-sm"
            : "bg-white dark:bg-[#1e3d2a] border-gray-300 dark:border-[#2d5a3d] text-gray-600 dark:text-[#a8d4b8] hover:border-yellow-400 hover:text-yellow-600"
        }`}
      >
        <Star className="w-3.5 h-3.5" /> Yes
      </button>
      <button
        onClick={() => toggleFeatured("false")}
        className={`flex items-center gap-1.5 px-4 ${size === "lg" ? "py-1.5" : "py-2"} rounded-lg text-sm font-semibold border transition-all duration-200 cursor-pointer ${
          localFilter.isFeatured === "false"
            ? "bg-gray-500 border-gray-500 text-white shadow-sm"
            : "bg-white dark:bg-[#1e3d2a] border-gray-300 dark:border-[#2d5a3d] text-gray-600 dark:text-[#a8d4b8] hover:border-gray-400"
        }`}
      >
        Not Featured
      </button>
    </div>
  );

  const onSaleButton = (size: "sm" | "lg") => (
    <div className={`flex gap-2 ${size === "lg" ? "items-center" : ""}`}>
      {size === "lg" && (
        <span className="text-sm font-semibold text-gray-600 dark:text-[#a8d4b8] flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-red-400" /> On Sale:
        </span>
      )}
      {size === "sm" && (
        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">
          On Sale
        </p>
      )}
      <button
        onClick={toggleOnSale}
        className={`flex items-center gap-1.5 px-4 ${size === "lg" ? "py-1.5" : "py-2"} rounded-lg text-sm font-semibold border transition-all duration-200 cursor-pointer ${
          localFilter.onSale === "true"
            ? "bg-red-400 border-red-400 text-white shadow-sm"
            : "bg-white dark:bg-[#1e3d2a] border-gray-300 dark:border-[#2d5a3d] text-gray-600 dark:text-[#a8d4b8] hover:border-red-400 hover:text-red-500"
        }`}
      >
        <Tag className="w-3.5 h-3.5" /> Discounted
      </button>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#162820] p-4 rounded-lg shadow-md mb-6 border border-transparent dark:border-[#2d5a3d]">
      {/* Mobile toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-between p-3 bg-primary/10 dark:bg-[#1e3d2a] rounded-lg mb-3"
      >
        <span className="flex items-center gap-2 font-semibold text-color dark:text-[#c8e6d0] text-sm sm:text-base">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          Filters{" "}
          {hasActiveFilters() &&
            `(${Object.values(appliedFilter).filter((v) => v !== "").length})`}
        </span>
        <ChevronDown
          className={`w-5 h-5 dark:text-[#7aab8a] transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
      </button>

      {/* Mobile filters */}
      <div className={`${showFilters ? "block" : "hidden"} lg:hidden space-y-3`}>
        <input
          type="text"
          placeholder="Search by name or description..."
          value={localFilter.search}
          onChange={(e) => set("search", e.target.value)}
          className={`${INPUT_CLASS} w-full text-sm sm:text-base`}
        />
        <div className="grid grid-cols-1 gap-2">
          <select
            value={localFilter.category}
            onChange={(e) => set("category", e.target.value)}
            className={`${INPUT_CLASS} text-sm sm:text-base cursor-pointer`}
          >
            <option value="">All Categories</option>
            <option value="Cat">Cat</option>
            <option value="Dog">Dog</option>
            <option value="Bird">Bird</option>
            <option value="Fish">Fish</option>
            <option value="Reptile">Reptile</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Horse">Horse</option>
          </select>
          <select
            value={localFilter.isActive}
            onChange={(e) => set("isActive", e.target.value)}
            className={`${INPUT_CLASS} text-sm sm:text-base`}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div>{featuredButtons("sm")}</div>
        <div>{onSaleButton("sm")}</div>

        {(["Price", "Stock", "Sold"] as const).map((label) => {
          const minKey = `min${label}` as keyof Filters;
          const maxKey = `max${label}` as keyof Filters;
          return (
            <div key={label}>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">
                {label} Range
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilter[minKey]}
                  onChange={(e) => set(minKey, e.target.value)}
                  className={`${INPUT_CLASS} text-sm sm:text-base`}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilter[maxKey]}
                  onChange={(e) => set(maxKey, e.target.value)}
                  className={`${INPUT_CLASS} text-sm sm:text-base`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={localFilter.search}
            onChange={(e) => set("search", e.target.value)}
            className={`${INPUT_CLASS} flex-1 min-w-[200px]`}
          />
          <select
            value={localFilter.category}
            onChange={(e) => set("category", e.target.value)}
            className={`${INPUT_CLASS} min-w-[150px]`}
          >
            <option value="">All Categories</option>
            <option value="Cat">Cat</option>
            <option value="Dog">Dog</option>
            <option value="Bird">Bird</option>
            <option value="Fish">Fish</option>
            <option value="Reptile">Reptile</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Horse">Horse</option>
          </select>
          <select
            value={localFilter.isActive}
            onChange={(e) => set("isActive", e.target.value)}
            className={`${INPUT_CLASS} min-w-[150px]`}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {(["minPrice", "maxPrice", "minSold", "maxSold", "minStock", "maxStock"] as const).map((key) => (
            <input
              key={key}
              type="number"
              placeholder={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
              value={localFilter[key]}
              onChange={(e) => set(key, e.target.value)}
              className={`${INPUT_CLASS} w-28`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {featuredButtons("lg")}
          <div className="w-px h-6 bg-gray-200 dark:bg-[#2d5a3d]" />
          {onSaleButton("lg")}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-[#2d5a3d]">
        <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
          Showing{" "}
          <span className="font-bold text-color dark:text-[#a8d4b8]!">
            {filteredProducts}
          </span>{" "}
          of{" "}
          <span className="font-bold text-black/60 dark:text-[#c8e6d0]!">
            {totalProducts}
          </span>{" "}
          products
          {hasActiveFilters() && (
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] ml-2">
              (Filtered results)
            </span>
          )}
        </p>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="w-40 flex gap-2 justify-center items-center bg-white dark:bg-[#1e3d2a] text-gray-800 dark:text-[#c8e6d0] border dark:border-[#2d5a3d] rounded-sm p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
          >
            <Trash2 className="w-4 h-4" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;