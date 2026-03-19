"use client";
import React from "react";
import { Plus, DollarSign } from "lucide-react";

interface Props {
  code: string;
  setCode: (v: string) => void;
  percent: string;
  setPercent: (v: string) => void;
  minAmount: string;
  setMinAmount: (v: string) => void;
  expiryDate: string;
  setExpiryDate: (v: string) => void;
  discountType: string;
  setDiscountType: (v: string) => void;
  createDiscount: (e: React.FormEvent) => void;
  handleReset: () => void;
}

const CreateDiscountForm = ({
  code, setCode,
  percent, setPercent,
  minAmount, setMinAmount,
  expiryDate, setExpiryDate,
  discountType, setDiscountType,
  createDiscount, handleReset,
}: Props) => {
  return (
    <div className="bg-white dark:bg-[#162820] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#c8e6d0]">Create Discount Code</h2>
        <p className="text-sm text-slate-500 dark:text-[#7aab8a]">Configure new promotional offers for your customers.</p>
      </div>

      <form onSubmit={createDiscount} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-[#c8e6d0]">Code Name</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#c8e6d0] placeholder-slate-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
              placeholder="e.g. SUMMER2024"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-[#c8e6d0]">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#c8e6d0] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-[#c8e6d0]">Value</label>
            <div className="relative">
              <input
                type="number"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#c8e6d0] placeholder-slate-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
                placeholder="20"
                min={1}
                max={100}
              />
              <span className="absolute right-4 top-2.5 text-slate-400 dark:text-[#7aab8a] font-medium">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-[#c8e6d0]">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#c8e6d0] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-[#c8e6d0]">
              Minimum Order Amount
              <span className="ml-1 text-slate-400 dark:text-[#7aab8a] font-normal text-xs">
                (Optional — coupon won't apply below this)
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400 dark:text-[#7aab8a] font-medium">$</span>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#c8e6d0] placeholder-slate-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
                placeholder="0.00"
                min={0}
              />
            </div>
            {minAmount && Number(minAmount) > 0 && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Customers must spend at least ${Number(minAmount).toFixed(2)} to use this code.
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border border-slate-200 dark:border-white/10 text-sm font-semibold rounded-lg text-gray-700 dark:text-[#c8e6d0] hover:bg-slate-50 dark:hover:bg-[#1e3d2a] transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#97cba9] dark:bg-[#0b8457] text-white text-sm font-semibold rounded-lg hover:bg-[#7fb894] dark:hover:bg-[#0E5F44] shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Code
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDiscountForm;