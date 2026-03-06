"use client";
import React from "react";
import { Truck } from "lucide-react";

interface Props {
  shippingFee: string;
  setShippingFee: (v: string) => void;
  freeOver: string;
  setFreeOver: (v: string) => void;
  freeShippingEnabled: boolean;
  setFreeShippingEnabled: (v: boolean) => void;
  updateShipping: () => void;
}

const ShippingSettings = ({
  shippingFee, setShippingFee,
  freeOver, setFreeOver,
  freeShippingEnabled, setFreeShippingEnabled,
  updateShipping,
}: Props) => {
  return (
    <div className="bg-white dark:bg-[#162820] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#c8e6d0]">Shipping Settings</h2>
        <p className="text-sm text-slate-500 dark:text-[#7aab8a]">Manage rates and free delivery rules.</p>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#c8e6d0]">Free Shipping Threshold</h4>
            <p className="text-xs text-slate-500 dark:text-[#7aab8a]">Enable free shipping on large orders.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={freeShippingEnabled}
              onChange={(e) => setFreeShippingEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-[#1e3d2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b8457]" />
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-[#c8e6d0]">
              Minimum Order Value
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400 dark:text-[#7aab8a] font-medium">$</span>
              <input
                type="number"
                value={freeOver}
                onChange={(e) => setFreeOver(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#c8e6d0] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-[#c8e6d0]">
              Standard Flat Rate
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400 dark:text-[#7aab8a] font-medium">$</span>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#1e3d2a] border border-slate-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#c8e6d0] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          onClick={updateShipping}
          className="w-full py-2.5 bg-[#162820] dark:bg-[#0b8457] text-white text-sm font-semibold rounded-lg hover:bg-[#1e3d2a] dark:hover:bg-[#0E5F44] transition-colors flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          Update Shipping Logic
        </button>
      </div>
    </div>
  );
};

export default ShippingSettings;