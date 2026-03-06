"use client";
import React from "react";
import { ExternalLink, Edit3 } from "lucide-react";
import { Order } from "./types";

interface Props {
  selectedTracking: Order;
  showShippingForm: boolean;
  setShowShippingForm: (v: boolean) => void;
  formatDate: (d: string) => string;
}

const TrackingInfoCard = ({ selectedTracking, showShippingForm, setShowShippingForm, formatDate }: Props) => {
  if (!selectedTracking.tracking?.trackingNumber) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">No tracking information yet.</p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Add tracking details below.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
            {selectedTracking.tracking.cargoCompany} Tracking Number
          </p>
          <p className="text-lg font-black text-blue-900 dark:text-blue-200 font-mono">
            {selectedTracking.tracking.trackingNumber}
          </p>
          {selectedTracking.tracking.estimatedDelivery && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Est. Delivery:{" "}
              <span className="font-bold">{formatDate(selectedTracking.tracking.estimatedDelivery)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {selectedTracking.tracking.trackingUrl && (
            <a
              href={selectedTracking.tracking.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#162820] text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800/40"
            >
              <ExternalLink className="w-4 h-4" />
              Track on {selectedTracking.tracking.cargoCompany}
            </a>
          )}
          <button
            onClick={() => setShowShippingForm(!showShippingForm)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#162820] text-gray-600 dark:text-[#7aab8a] font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3d2a] transition-colors border border-gray-200 dark:border-[#2d5a3d]"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingInfoCard;