"use client";
import React from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { CARGO_COMPANIES } from "./types";

interface Props {
  shippingForm: { trackingNumber: string; cargoCompany: (typeof CARGO_COMPANIES)[number]; estimatedDelivery: string };
  setShippingForm: (f: any) => void;
  updatingTracking: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const inputClass = "w-full border border-gray-300 dark:border-[#2d5a3d] bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#97cba9] focus:border-transparent";
const labelClass = "text-xs font-bold text-gray-600 dark:text-[#7aab8a] uppercase tracking-wider mb-1 block";

const TrackingForm = ({ shippingForm, setShippingForm, updatingTracking, onSave, onCancel }: Props) => {
  return (
    <div className="bg-gray-50 dark:bg-[#1e3d2a] border border-gray-200 dark:border-[#2d5a3d] rounded-xl p-4 mb-6">
      <h4 className="font-bold text-gray-900 dark:text-[#c8e6d0] mb-3 text-sm">Update Tracking Info</h4>
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Cargo Company</label>
          <select
            value={shippingForm.cargoCompany}
            onChange={(e) => setShippingForm({ ...shippingForm, cargoCompany: e.target.value as (typeof CARGO_COMPANIES)[number] })}
            className={inputClass}
          >
            {CARGO_COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tracking Number</label>
          <input
            type="text"
            placeholder="Enter tracking number"
            value={shippingForm.trackingNumber}
            onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
            className={inputClass}
            maxLength={100}
          />
        </div>
        <div>
          <label className={labelClass}>Estimated Delivery</label>
          <input
            type="date"
            value={shippingForm.estimatedDelivery}
            onChange={(e) => setShippingForm({ ...shippingForm, estimatedDelivery: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            disabled={updatingTracking || !shippingForm.trackingNumber}
            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              updatingTracking || !shippingForm.trackingNumber
                ? "bg-gray-300 dark:bg-[#2d5a3d] text-gray-500 dark:text-[#7aab8a] cursor-not-allowed"
                : "bg-gradient-to-br from-[#97cba9] to-[#7ab89a] text-white hover:shadow-lg"
            }`}
          >
            <Save className="w-4 h-4" />
            {updatingTracking ? "Saving..." : "Save Tracking"}
          </motion.button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-200 dark:bg-[#162820] text-gray-600 dark:text-[#7aab8a] hover:bg-gray-300 dark:hover:bg-[#2d5a3d] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingForm;