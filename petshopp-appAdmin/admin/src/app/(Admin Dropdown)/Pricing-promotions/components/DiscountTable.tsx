"use client";
import React from "react";
import { Tag, Search, Filter, X } from "lucide-react";
import { Discount } from "./useDiscounts";

interface Props {
  pagedDiscounts: Discount[];
  searchQuery: string;
  handleSearch: (v: string) => void;
  deleteDiscount: (id: string, code: string) => void;
}

const DiscountTable = ({ pagedDiscounts, searchQuery, handleSearch, deleteDiscount }: Props) => {
  return (
    <>
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#c8e6d0]">Active Discount Codes</h2>
          <p className="text-sm text-slate-500 dark:text-[#7aab8a]">Showing all current and upcoming promotions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-[#7aab8a] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-[#c8e6d0] placeholder-slate-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent w-64"
              placeholder="Search codes..."
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-semibold text-gray-700 dark:text-[#c8e6d0] hover:bg-slate-50 dark:hover:bg-[#1e3d2a] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-[#1e3d2a]/60 text-slate-500 dark:text-[#7aab8a] uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Code Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Min. Amount</th>
              <th className="px-6 py-4">Expiry Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {pagedDiscounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Tag className="w-16 h-16 text-slate-300 dark:text-[#2d5a3d] mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-[#c8e6d0] mb-2">
                      No discount codes found
                    </h3>
                    <p className="text-slate-500 dark:text-[#7aab8a] text-sm">
                      {searchQuery ? "Try adjusting your search" : "Create your first discount code above"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedDiscounts.map((d) => {
                const statusColor =
                  d.status === "expired"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : d.status === "scheduled"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";

                return (
                  <tr key={d._id} className="hover:bg-slate-50 dark:hover:bg-[#1e3d2a]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#97cba9]/10 dark:bg-[#0b8457]/20 flex items-center justify-center">
                          <Tag className="text-[#97cba9] dark:text-[#7aab8a] w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-[#c8e6d0]">{d.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-[#a8d4b8]">Percentage</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-[#a8d4b8]">{d.percent}% Off</td>
                    <td className="px-6 py-4 text-sm">
                      {d.minAmount > 0 ? (
                        <span className="font-medium text-amber-600 dark:text-amber-400">${d.minAmount}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-[#7aab8a]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-[#a8d4b8]">
                      {d.expiryDate ? (
                        new Date(d.expiryDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      ) : (
                        <span className="text-slate-400 dark:text-[#7aab8a]">No expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${statusColor}`}>
                        {d.status ?? "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteDiscount(d._id, d.code)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete coupon"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DiscountTable;