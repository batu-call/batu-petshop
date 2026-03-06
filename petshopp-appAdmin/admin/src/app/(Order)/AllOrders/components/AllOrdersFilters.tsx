"use client";
import React from "react";
import { Trash2, ChevronDown, Filter } from "lucide-react";

type FilterState = {
  search: string;
  email: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
};

type Props = {
  localFilter: FilterState;
  setLocalFilter: (f: FilterState) => void;
  appliedFilter: FilterState;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  totalOrders: number;
  totalAllOrders: number;
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
};

const INPUT_CLASS =
  "border border-gray-300 dark:border-[#2d5a3d] p-2 rounded bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-1 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] [&>option]:bg-white dark:[&>option]:bg-[#1e3d2a] [&>option]:text-gray-900 dark:[&>option]:text-[#c8e6d0]";

const AllOrdersFilters = ({
  localFilter,
  setLocalFilter,
  appliedFilter,
  showFilters,
  setShowFilters,
  totalOrders,
  totalAllOrders,
  hasActiveFilters,
  clearFilters,
}: Props) => {
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
      <div
        className={`${showFilters ? "block" : "hidden"} lg:hidden space-y-3`}
      >
        <input
          type="text"
          placeholder="Search by name..."
          value={localFilter.search}
          onChange={(e) =>
            setLocalFilter({ ...localFilter, search: e.target.value })
          }
          autoComplete="off"
          maxLength={50}
          className={`${INPUT_CLASS} p-2 sm:p-2.5 w-full text-sm sm:text-base`}
        />
        <input
          type="text"
          placeholder="Filter by user email..."
          value={localFilter.email}
          onChange={(e) =>
            setLocalFilter({ ...localFilter, email: e.target.value })
          }
          autoComplete="off"
          maxLength={50}
          className={`${INPUT_CLASS} p-2 sm:p-2.5 w-full text-sm sm:text-base`}
        />
        <select
          value={localFilter.status}
          onChange={(e) =>
            setLocalFilter({ ...localFilter, status: e.target.value })
          }
          className={`${INPUT_CLASS} p-2 sm:p-2.5 w-full text-sm sm:text-base`}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">
            Price Range
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <input
              type="number"
              placeholder="Min"
              value={localFilter.minPrice}
              onChange={(e) =>
                setLocalFilter({ ...localFilter, minPrice: e.target.value })
              }
              min="0"
              step="0.01"
              autoComplete="off"
              className={`${INPUT_CLASS} p-2 sm:p-2.5 text-sm sm:text-base`}
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilter.maxPrice}
              onChange={(e) =>
                setLocalFilter({ ...localFilter, maxPrice: e.target.value })
              }
              min="0"
              step="0.01"
              autoComplete="off"
              className={`${INPUT_CLASS} p-2 sm:p-2.5 text-sm sm:text-base`}
            />
          </div>
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">
            Date Range
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <input
              type="date"
              value={localFilter.startDate}
              onChange={(e) =>
                setLocalFilter({ ...localFilter, startDate: e.target.value })
              }
              className={`${INPUT_CLASS} p-2 sm:p-2.5 text-sm sm:text-base`}
            />
            <input
              type="date"
              value={localFilter.endDate}
              onChange={(e) =>
                setLocalFilter({ ...localFilter, endDate: e.target.value })
              }
              className={`${INPUT_CLASS} p-2 sm:p-2.5 text-sm sm:text-base`}
            />
          </div>
        </div>
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={localFilter.search}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, search: e.target.value })
            }
            autoComplete="off"
            maxLength={50}
            className={`${INPUT_CLASS} flex-1 min-w-[200px]`}
          />
          <input
            type="text"
            placeholder="Filter by user email..."
            value={localFilter.email}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, email: e.target.value })
            }
            autoComplete="off"
            maxLength={50}
            className={`${INPUT_CLASS} min-w-[200px]`}
          />
          <select
            value={localFilter.status}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, status: e.target.value })
            }
            className={`${INPUT_CLASS} min-w-[150px]`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={localFilter.minPrice}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, minPrice: e.target.value })
            }
            min="0"
            step="0.01"
            autoComplete="off"
            className={`${INPUT_CLASS} w-32`}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={localFilter.maxPrice}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, maxPrice: e.target.value })
            }
            min="0"
            step="0.01"
            autoComplete="off"
            className={`${INPUT_CLASS} w-32`}
          />
          <input
            type="date"
            value={localFilter.startDate}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, startDate: e.target.value })
            }
            className={`${INPUT_CLASS} w-40`}
          />
          <input
            type="date"
            value={localFilter.endDate}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, endDate: e.target.value })
            }
            className={`${INPUT_CLASS} w-40`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-[#2d5a3d]">
        <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
          Showing{" "}
          <span className="font-bold text-color dark:text-[#a8d4b8]!">
            {totalOrders}
          </span>{" "}
          of{" "}
          <span className="font-bold text-black/60 dark:text-[#c8e6d0]">
            {totalAllOrders}
          </span>{" "}
          orders
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

export default AllOrdersFilters;
