"use client";

import { Filter, ChevronDown, Trash2 } from "lucide-react";
import { useState } from "react";

type LocalFilter = {
  search: string;
  minOrders: string;
  maxOrders: string;
};

type Props = {
  localFilter: LocalFilter;
  setLocalFilter: (f: LocalFilter) => void;
  appliedFilter: LocalFilter;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  filteredUsers: number;
  totalUsers: number;
};

const INPUT_CLASS =
  "border border-gray-300 dark:border-[#2d5a3d] p-2 rounded bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-1 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] [&>option]:bg-white dark:[&>option]:bg-[#1e3d2a] [&>option]:text-gray-900 dark:[&>option]:text-[#c8e6d0]";

const UserFilters = ({
  localFilter,
  setLocalFilter,
  appliedFilter,
  hasActiveFilters,
  clearFilters,
  filteredUsers,
  totalUsers,
}: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const set = (key: keyof LocalFilter, value: string) =>
    setLocalFilter({ ...localFilter, [key]: value });

  return (
    <div className="bg-white dark:bg-[#162820] p-4 rounded-lg shadow-md mb-6 border border-transparent dark:border-[#2d5a3d]">
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-between p-3 bg-primary/10 dark:bg-[#1e3d2a] rounded-lg mb-3"
      >
        <span className="flex items-center gap-2 font-semibold text-color dark:text-[#c8e6d0] text-sm sm:text-base">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          Filters{" "}
          {hasActiveFilters &&
            `(${Object.values(appliedFilter).filter((v) => v !== "").length})`}
        </span>
        <ChevronDown
          className={`w-5 h-5 dark:text-[#7aab8a] transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
      </button>

      {/* Mobile Filters */}
      <div
        className={`${showFilters ? "block" : "hidden"} lg:hidden space-y-3`}
      >
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={localFilter.search}
          onChange={(e) => set("search", e.target.value)}
          className={`${INPUT_CLASS} w-full text-sm sm:text-base`}
        />
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">
            Order Range
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <input
              type="number"
              placeholder="Min Orders"
              value={localFilter.minOrders}
              onChange={(e) => set("minOrders", e.target.value)}
              className={`${INPUT_CLASS} text-sm sm:text-base`}
            />
            <input
              type="number"
              placeholder="Max Orders"
              value={localFilter.maxOrders}
              onChange={(e) => set("maxOrders", e.target.value)}
              className={`${INPUT_CLASS} text-sm sm:text-base`}
            />
          </div>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={localFilter.search}
            onChange={(e) => set("search", e.target.value)}
            className={`${INPUT_CLASS} flex-1 min-w-[200px]`}
          />
          <input
            type="number"
            placeholder="Min Orders"
            value={localFilter.minOrders}
            onChange={(e) => set("minOrders", e.target.value)}
            className={`${INPUT_CLASS} w-32`}
          />
          <input
            type="number"
            placeholder="Max Orders"
            value={localFilter.maxOrders}
            onChange={(e) => set("maxOrders", e.target.value)}
            className={`${INPUT_CLASS} w-32`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-[#2d5a3d]">
        <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
          Showing{" "}
          <span className="font-bold text-color dark:text-[#a8d4b8]!">
            {filteredUsers}
          </span>{" "}
          of{" "}
          <span className="font-bold text-black/60 dark:text-[#c8e6d0]">
            {totalUsers}
          </span>{" "}
          users
          {hasActiveFilters && (
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] ml-2">
              (Filtered results)
            </span>
          )}
        </p>
        {hasActiveFilters && (
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

export default UserFilters;
